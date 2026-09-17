/**
 * Vértice — Pessoas & Estratégia
 * Endpoint Server-Side Seguro: POST /api/lead
 * Compatível com Vercel Serverless Functions e Node.js Local Dev Server.
 *
 * Separação Arquitetural Estrita:
 * - CANDIDATO = Recrutamento / Banco de Talentos (People Foundation / vertice_candidates)
 * - EMPRESA   = Pipeline Comercial Corporativo (Frappe CRM Lead)
 *
 * CANDIDATO NUNCA VIRA CRM LEAD.
 */

const fs = require('fs');
const path = require('path');

const ALLOWED_SERVICES = [
  'Recrutamento & Seleção',
  'Desenvolvimento de Líderes',
  'Pesquisa de Clima Organizacional',
  'Cargos, Salários & Carreiras',
  'Mapeamento Comportamental',
  'Outplacement',
  'Outro'
];

const EMPLOYEES_MAP = {
  '50 a 200 colaboradores': '51-200',
  '+1.000 colaboradores': '1000+'
};

// Proteção em memória contra flood por IP
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

  if (rateLimitMap.size > 2000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      if (timestamps.every(ts => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return false;
}

// Helper: Normalização de Telefone para formato E.164
function normalizePhoneE164(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }
  return `+${digits}`;
}

// Helper: Parsing de Cidade / Estado
function parseCityState(cidadeUf) {
  const raw = String(cidadeUf || '').trim();
  if (!raw) return { city: null, state: null };
  const parts = raw.split(/[\/\-,]/).map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1].toUpperCase().slice(0, 2)
    };
  }
  return { city: raw, state: null };
}

/**
 * Roteamento Especializado: CANDIDATO (Banco de Talentos / People Foundation)
 * Garante que o candidato NUNCA seja gravado em CRM Lead.
 */
async function handleCandidateSubmission(req, res, body, clientIp, utmData) {
  const rawName = String(body.nome || body.first_name || '').trim();
  const rawPhone = String(body.whatsapp || body.mobile_no || '').trim();
  const rawEmail = String(body.email || '').trim().toLowerCase();
  const rawArea = String(body.area_atuacao || '').trim();
  const rawCidadeUf = String(body.cidade_uf || body.cidade || '').trim().slice(0, 100);
  const rawCargoObj = String(body.cargo_objetivo || body.cargo || '').trim().slice(0, 140);
  const rawLinkedin = String(body.linkedin || '').trim().slice(0, 250);
  const rawApresentacao = String(body.mensagem || '').trim().slice(0, 2000);

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
  if (!rawArea || rawArea.length < 2 || rawArea.length > 140) {
    return res.status(400).json({ success: false, error: 'validation_error', message: 'Área de atuação obrigatória' });
  }

  const phoneE164 = normalizePhoneE164(rawPhone);
  const { city, state } = parseCityState(rawCidadeUf);
  const emailNormalized = rawEmail.toLowerCase().trim();

  const candidatePayload = {
    id: `cand_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    full_name: rawName,
    email: rawEmail,
    email_normalized: emailNormalized,
    phone: rawPhone,
    phone_e164: phoneE164,
    city: city,
    state: state,
    area: rawArea,
    current_job_title: rawCargoObj || null,
    linkedin_url: rawLinkedin || null,
    notes: rawApresentacao || null,
    source: 'site_talentos',
    status: 'active',
    utm_source: utmData.utmSource || null,
    utm_medium: utmData.utmMedium || null,
    utm_campaign: utmData.utmCampaign || null,
    utm_content: utmData.utmContent || null,
    landing_page: utmData.landingPage || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Envio Direto ao People Foundation (Supabase) se variáveis configuradas
  const supabaseUrl = process.env.SUPABASE_URL || process.env.PEOPLE_API_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/vertice_candidates`;
      const sResponse = await fetch(restUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation,resolution=merge-duplicates'
        },
        body: JSON.stringify(candidatePayload)
      });
      if (sResponse.ok) {
        const sData = await sResponse.json().catch(() => []);
        console.info('[PEOPLE FOUNDATION]: Candidato persistido no Supabase:', emailNormalized);
        return res.status(200).json({
          success: true,
          tipo: 'candidato',
          destination: 'vertice_candidates',
          candidate_id: sData[0]?.id || candidatePayload.id
        });
      }
    } catch (err) {
      console.warn('[PEOPLE FOUNDATION REST FALHA]:', err.message);
    }
  }

  // 2. Persistência Server-Side Segura em Buffer Local (site/data/candidates.jsonl)
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dataFile = path.join(dataDir, 'candidates.jsonl');

    let existingLines = [];
    if (fs.existsSync(dataFile)) {
      existingLines = fs.readFileSync(dataFile, 'utf8')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          try { return JSON.parse(l); } catch (e) { return null; }
        })
        .filter(Boolean);
    }

    const existingIdx = existingLines.findIndex(c =>
      (c.email_normalized && c.email_normalized === emailNormalized) ||
      (c.phone_e164 && c.phone_e164 === phoneE164)
    );

    if (existingIdx !== -1) {
      candidatePayload.id = existingLines[existingIdx].id || candidatePayload.id;
      candidatePayload.created_at = existingLines[existingIdx].created_at || candidatePayload.created_at;
      existingLines[existingIdx] = candidatePayload;
      fs.writeFileSync(dataFile, existingLines.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
      console.info(`[BANCO DE TALENTOS DEDUPE]: Candidato atualizado (ID: ${candidatePayload.id}, email: ${emailNormalized})`);
    } else {
      fs.appendFileSync(dataFile, JSON.stringify(candidatePayload) + '\n', 'utf8');
      console.info(`[BANCO DE TALENTOS NOVO]: Candidato inserido (ID: ${candidatePayload.id}, email: ${emailNormalized})`);
    }

    return res.status(200).json({
      success: true,
      tipo: 'candidato',
      destination: 'banco_de_talentos',
      candidate_id: candidatePayload.id
    });
  } catch (storeErr) {
    console.error('[ERRO STORAGE CANDIDATO]:', storeErr);
    return res.status(500).json({
      success: false,
      error: 'candidate_storage_error'
    });
  }
}

/**
 * Roteamento Comercial: EMPRESA (B2B Lead Pipeline)
 * Mantém o fluxo comercial para Frappe CRM Lead.
 */
async function handleEmpresaSubmission(req, res, body, clientIp, utmData) {
  const rawName = String(body.nome || body.first_name || '').trim();
  const rawPhone = String(body.whatsapp || body.mobile_no || '').trim();
  const rawEmail = String(body.email || '').trim().toLowerCase();
  const rawOrg = String(body.empresa || body.organization || '').trim();
  const rawJob = String(body.cargo || body.job_title || '').trim();
  const rawService = String(body.servico || body.service_of_interest || '').trim();
  const rawPorte = String(body.porte || '').trim();
  const rawChallenge = String(body.desafio || body.challenge || '').trim();

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

  const frappeLeadData = {
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

  if (utmData.utmSource) frappeLeadData.utm_source = utmData.utmSource;
  if (utmData.utmMedium) frappeLeadData.utm_medium = utmData.utmMedium;
  if (utmData.utmCampaign) frappeLeadData.utm_campaign = utmData.utmCampaign;
  if (utmData.utmContent) frappeLeadData.utm_content = utmData.utmContent;
  if (utmData.landingPage) frappeLeadData.landing_page = utmData.landingPage;

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
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const frappeResponse = await fetch(frappeUrl, {
      method: 'POST',
      headers: frappeHeaders,
      body: JSON.stringify(frappeLeadData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (frappeResponse.status === 200 || frappeResponse.status === 201) {
      const responseData = await frappeResponse.json();
      console.info('[FRAPPE CRM SUCESSO]: Lead B2B criado com ID:', responseData?.data?.name || 'sucesso');
      return res.status(200).json({
        success: true,
        tipo: 'empresa',
        destination: 'crm_lead'
      });
    } else {
      const errorText = await frappeResponse.text();
      console.error(`[FRAPPE CRM FALHA]: Status ${frappeResponse.status} - Resposta:`, errorText.slice(0, 300));
      return res.status(502).json({
        success: false,
        error: 'crm_unavailable'
      });
    }
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    console.error('[ERRO CONEXÃO CRM]:', fetchErr.message);
    return res.status(502).json({
      success: false,
      error: 'crm_unavailable'
    });
  }
}

/**
 * Handler Principal da API
 */
module.exports = async function handler(req, res) {
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

    // Honeypot Anti-Spam
    if (body.website_url_hp || body.hp_field || body.website_hp) {
      console.warn('[ANTI-SPAM] Submissão bloqueada por honeypot:', clientIp);
      return res.status(400).json({
        success: false,
        error: 'validation_error'
      });
    }

    const utmData = {
      utmSource: String(body.utm_source || '').trim().slice(0, 140),
      utmMedium: String(body.utm_medium || '').trim().slice(0, 140),
      utmCampaign: String(body.utm_campaign || '').trim().slice(0, 140),
      utmContent: String(body.utm_content || '').trim().slice(0, 140),
      landingPage: String(body.landing_page || body.page_url || '').trim().slice(0, 500)
    };

    const tipo = String(body.tipo || 'empresa').trim().toLowerCase();

    // ROTEAMENTO ESTRITO: CANDIDATO vs EMPRESA
    if (tipo === 'candidato') {
      return await handleCandidateSubmission(req, res, body, clientIp, utmData);
    } else {
      return await handleEmpresaSubmission(req, res, body, clientIp, utmData);
    }

  } catch (err) {
    console.error('[ERRO INESPERADO /api/lead]:', err.message || err);
    return res.status(502).json({
      success: false,
      error: 'crm_unavailable'
    });
  }
};
