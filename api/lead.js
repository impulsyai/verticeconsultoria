/**
 * Vértice — Pessoas & Estratégia
 * Endpoint Server-Side Seguro: POST /api/lead
 * Compatível com Vercel Serverless Functions e Node.js Local Dev Server.
 *
 * Responsabilidade:
 * - Recebe submissões do formulário B2B do site
 * - Valida honeypot anti-spam
 * - Aplica rate limiting em memória
 * - Valida e higieniza payload e campos obrigatórios
 * - Autentica no Frappe CRM via credenciais server-side (FRAPPE_API_KEY / FRAPPE_API_SECRET)
 * - Cria registro no DocType 'CRM Lead'
 * - Retorna respostas limpas e padronizadas sem vazar credenciais ou detalhes internos
 */

const ALLOWED_SERVICES = [
  'Recrutamento & Seleção',
  'Desenvolvimento de Líderes',
  'Pesquisa de Clima Organizacional',
  'Cargos, Salários & Carreiras',
  'Mapeamento Comportamental',
  'Outplacement',
  'Outro'
];

// Mapeamento estrito apenas para faixas com correspondência semântica segura no CRM Lead.
// Faixas amplas como "200 a 1.000 colaboradores" e "Até 50 colaboradores" são preservadas fielmente
// no campo 'challenge', sem forçar valores imprecisos no Select 'no_of_employees'.
// Futuramente o formulário poderá ser refinado para faixas atômicas (ex: 201-500, 501-1000, 1000+).
const EMPLOYEES_MAP = {
  '50 a 200 colaboradores': '51-200',
  '+1.000 colaboradores': '1000+'
};

// Proteção leve em memória (best-effort por nó/instância serverless).
// NOTA ARQUITETURAL: Em ambientes serverless com múltiplas réplicas concorrentes,
// o Map em memória atua como barreira leve contra floods locais.
// Proteção robusta futura em escala poderá utilizar Cloudflare Turnstile e/ou store persistente.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX || '30', 10);

function isRateLimited(ip) {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip) || [];
  const validTimestamps = userRecord.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);

  // Limpeza periódica preventiva
  if (rateLimitMap.size > 2000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      if (timestamps.every(ts => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return false;
}

module.exports = async function handler(req, res) {
  // Operação Same-Origin: preflight OPTIONS tratado com 204 sem wildcards permissivos
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'method_not_allowed'
    });
  }

  try {
    // 1. Rate Limiting por IP
    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
                     req.headers['x-real-ip'] ||
                     req.socket?.remoteAddress ||
                     'unknown';

    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'too_many_requests'
      });
    }

    // 2. Parse do Corpo da Requisição
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          error: 'validation_error'
        });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'validation_error'
      });
    }

    // 3. Honeypot Anti-Spam (se preenchido, rejeitar silenciosamente)
    if (body.website_url_hp || body.hp_field || body.website_hp) {
      console.warn('[ANTI-SPAM] Submissão bloqueada por preenchimento de honeypot:', clientIp);
      return res.status(400).json({
        success: false,
        error: 'validation_error'
      });
    }

    // 4. Extração e Normalização de Campos
    const tipo = String(body.tipo || 'empresa').trim().toLowerCase();
    const isCandidato = tipo === 'candidato';

    const rawName = String(body.nome || body.first_name || '').trim();
    const rawPhone = String(body.whatsapp || body.mobile_no || '').trim();
    const rawEmail = String(body.email || '').trim().toLowerCase();

    // UTMs & Contexto
    const utmSource = String(body.utm_source || '').trim().slice(0, 140);
    const utmMedium = String(body.utm_medium || '').trim().slice(0, 140);
    const utmCampaign = String(body.utm_campaign || '').trim().slice(0, 140);
    const utmContent = String(body.utm_content || '').trim().slice(0, 140);
    const landingPage = String(body.landing_page || body.page_url || '').trim().slice(0, 500);

    // E-mail e Telefone comuns a ambos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawName || rawName.length < 2 || rawName.length > 140) {
      return res.status(400).json({ success: false, error: 'validation_error', message: 'Nome inválido' });
    }
    if (!rawEmail || rawEmail.length > 140 || !emailRegex.test(rawEmail)) {
      return res.status(400).json({ success: false, error: 'validation_error', message: 'E-mail inválido' });
    }
    const phoneDigits = rawPhone.replace(/\D/g, '');
    if (!rawPhone || phoneDigits.length < 10 || rawPhone.length > 30) {
      return res.status(400).json({ success: false, error: 'validation_error', message: 'WhatsApp/telefone inválido' });
    }

    let frappeLeadData;

    if (isCandidato) {
      // 5A. Validação Específica para Candidato / Banco de Talentos
      const rawArea = String(body.area_atuacao || '').trim();
      const rawCidadeUf = String(body.cidade_uf || '').trim().slice(0, 100);
      const rawCargoObj = String(body.cargo_objetivo || '').trim().slice(0, 140);
      const rawLinkedin = String(body.linkedin || '').trim().slice(0, 250);
      const rawApresentacao = String(body.mensagem || '').trim().slice(0, 2000);

      if (!rawArea || rawArea.length < 2 || rawArea.length > 140) {
        return res.status(400).json({ success: false, error: 'validation_error', message: 'Área de atuação obrigatória' });
      }

      const candidateNotes = [
        `[CADASTRO BANCO DE TALENTOS]`,
        `Área de Atuação: ${rawArea}`,
        rawCargoObj ? `Cargo / Objetivo: ${rawCargoObj}` : null,
        rawCidadeUf ? `Cidade/UF: ${rawCidadeUf}` : null,
        rawLinkedin ? `LinkedIn: ${rawLinkedin}` : null,
        rawApresentacao ? `Apresentação:\n${rawApresentacao}` : null,
        `Nota: Upload de currículo via site será implementado em fase posterior da infraestrutura.`
      ].filter(Boolean).join('\n\n');

      frappeLeadData = {
        first_name: rawName,
        organization: 'Candidato / Banco de Talentos',
        job_title: rawCargoObj || rawArea,
        mobile_no: rawPhone,
        email: rawEmail,
        service_of_interest: 'Recrutamento & Seleção',
        challenge: candidateNotes,
        source: 'Site - Banco de Talentos',
        status: 'NOVO'
      };
    } else {
      // 5B. Validação Severa Server-Side para Empresa (B2B)
      const rawOrg = String(body.empresa || body.organization || '').trim();
      const rawJob = String(body.cargo || body.job_title || '').trim();
      const rawService = String(body.servico || body.service_of_interest || '').trim();
      const rawPorte = String(body.porte || '').trim();
      const rawChallenge = String(body.desafio || body.challenge || '').trim();

      if (!rawOrg || rawOrg.length < 2 || rawOrg.length > 140) {
        return res.status(400).json({ success: false, error: 'validation_error', message: 'Empresa inválida' });
      }
      if (!rawJob || rawJob.length < 2 || rawJob.length > 120) {
        return res.status(400).json({ success: false, error: 'validation_error', message: 'Cargo inválido' });
      }
      if (!rawService || !ALLOWED_SERVICES.includes(rawService)) {
        return res.status(400).json({ success: false, error: 'validation_error', message: 'Serviço de interesse inválido' });
      }

      let fullChallenge = rawChallenge.slice(0, 2000);
      if (rawPorte) {
        const porteLabel = `[Porte da Organização: ${rawPorte.slice(0, 50)}]`;
        fullChallenge = fullChallenge ? `${fullChallenge}\n\n${porteLabel}` : porteLabel;
      }

      const employeesValue = EMPLOYEES_MAP[rawPorte] || null;

      frappeLeadData = {
        first_name: rawName,
        organization: rawOrg,
        job_title: rawJob,
        mobile_no: rawPhone,
        email: rawEmail,
        service_of_interest: rawService,
        challenge: fullChallenge,
        source: 'Site',
        status: 'NOVO'
      };

      if (employeesValue) {
        frappeLeadData.no_of_employees = employeesValue;
      }
    }
    if (utmSource) frappeLeadData.utm_source = utmSource;
    if (utmMedium) frappeLeadData.utm_medium = utmMedium;
    if (utmCampaign) frappeLeadData.utm_campaign = utmCampaign;
    if (utmContent) frappeLeadData.utm_content = utmContent;
    if (landingPage) frappeLeadData.landing_page = landingPage;

    // 7. Chamada Autenticada Server-Side para o Frappe CRM
    const frappeBaseUrl = (process.env.FRAPPE_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
    const frappeApiKey = process.env.FRAPPE_API_KEY;
    const frappeApiSecret = process.env.FRAPPE_API_SECRET;
    const frappeHostHeader = process.env.FRAPPE_HOST_HEADER;

    if (!frappeApiKey || !frappeApiSecret) {
      console.error('[ERRO DE CONFIGURAÇÃO]: Variáveis FRAPPE_API_KEY ou FRAPPE_API_SECRET não definidas no ambiente.');
      return res.status(500).json({
        success: false,
        error: 'crm_unavailable'
      });
    }

    const frappeHeaders = {
      'Authorization': `token ${frappeApiKey}:${frappeApiSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (frappeHostHeader) {
      frappeHeaders['Host'] = frappeHostHeader;
    }

    const frappeUrl = `${frappeBaseUrl}/api/resource/CRM Lead`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos timeout

    const frappeResponse = await fetch(frappeUrl, {
      method: 'POST',
      headers: frappeHeaders,
      body: JSON.stringify(frappeLeadData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (frappeResponse.status === 200 || frappeResponse.status === 201) {
      const responseData = await frappeResponse.json();
      console.info('[FRAPPE CRM SUCESSO]: Lead criado com ID:', responseData?.data?.name || 'sucesso');
      return res.status(200).json({
        success: true
      });
    } else {
      const errorText = await frappeResponse.text();
      console.error(`[FRAPPE CRM FALHA]: Status ${frappeResponse.status} - Resposta:`, errorText.slice(0, 300));
      return res.status(502).json({
        success: false,
        error: 'crm_unavailable'
      });
    }

  } catch (err) {
    console.error('[ERRO INESPERADO /api/lead]:', err.message || err);
    return res.status(502).json({
      success: false,
      error: 'crm_unavailable'
    });
  }
};
