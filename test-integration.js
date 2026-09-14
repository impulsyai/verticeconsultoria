/**
 * Vértice — Pessoas & Estratégia
 * Bateria de Testes Ponta a Ponta: Site B2B -> Endpoint /api/lead -> Frappe CRM
 */

async function runTests() {
  const BASE_URL = 'http://localhost:3000';
  console.log('=== INICIANDO BATERIA DE TESTES DE INTEGRAÇÃO SITE -> CRM ===\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      process.stdout.write(`[TESTE] ${name}... `);
      await fn();
      console.log('✅ PASSOU');
      passed++;
    } catch (err) {
      console.log('❌ FALHOU:', err.message);
      failed++;
    }
  }

  // 1. Teste de Sucesso com UTMs Completas (Cenário Oficial)
  await assertTest('1. Envio de Lead Válido com UTMs completas e Porte', async () => {
    const payload = {
      nome: 'Lead Integração Teste',
      empresa: 'EMPRESA TESTE SITE VERTICE',
      cargo: 'Diretor de Operações',
      whatsapp: '(81) 98888-7777',
      email: 'lead.teste@verticeconsultoria.com.br',
      servico: 'Recrutamento & Seleção',
      porte: '50 a 200 colaboradores',
      desafio: 'Teste de integração Site → CRM Fase 3.2',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'teste_vertice',
      utm_content: 'anuncio_a',
      landing_page: 'http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=teste_vertice&utm_content=anuncio_a'
    };

    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status !== 200) {
      throw new Error(`Status inesperado: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(`Resposta não indicou sucesso: ${JSON.stringify(data)}`);
    }
  });

  // 2. Teste de Honeypot Anti-Spam (Preenchimento por Bots)
  await assertTest('2. Rejeição de Spam via Honeypot preenchido', async () => {
    const payload = {
      nome: 'Bot Spammer',
      empresa: 'Spam Corp',
      cargo: 'Bot',
      whatsapp: '(81) 99999-9999',
      email: 'bot@spam.com',
      servico: 'Outro',
      website_url_hp: 'http://spamsite.com' // Honeypot preenchido
    };

    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status !== 400) {
      throw new Error(`Deveria retornar 400, retornou ${res.status}`);
    }

    const data = await res.json();
    if (data.success !== false || data.error !== 'validation_error') {
      throw new Error(`Erro esperado validation_error, recebido: ${JSON.stringify(data)}`);
    }
  });

  // 3. Teste de Validação: Campo Obrigatório Ausente (sem e-mail)
  await assertTest('3. Rejeição quando campo obrigatório ausente', async () => {
    const payload = {
      nome: 'Lead Sem Email',
      empresa: 'Empresa Teste',
      cargo: 'Gerente',
      whatsapp: '(81) 99999-9999',
      servico: 'Recrutamento & Seleção'
    };

    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status !== 400) {
      throw new Error(`Deveria retornar 400, retornou ${res.status}`);
    }
  });

  // 4. Teste de Validação: E-mail com Formato Inválido
  await assertTest('4. Rejeição de formato de e-mail inválido', async () => {
    const payload = {
      nome: 'Lead Email Invalido',
      empresa: 'Empresa Teste',
      cargo: 'Gerente',
      whatsapp: '(81) 99999-9999',
      email: 'email-sem-arroba',
      servico: 'Recrutamento & Seleção'
    };

    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status !== 400) {
      throw new Error(`Deveria retornar 400, retornou ${res.status}`);
    }
  });

  // 5. Teste de Validação: Serviço Não Permitido
  await assertTest('5. Rejeição de serviço fora da lista oficial', async () => {
    const payload = {
      nome: 'Lead Servico Invalido',
      empresa: 'Empresa Teste',
      cargo: 'Gerente',
      whatsapp: '(81) 99999-9999',
      email: 'lead@empresa.com.br',
      servico: 'Servico Fantasma Inexistente'
    };

    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status !== 400) {
      throw new Error(`Deveria retornar 400, retornou ${res.status}`);
    }
  });

  // 6. Teste de Método Inválido (GET em /api/lead)
  await assertTest('6. Rejeição de método GET (405 Method Not Allowed)', async () => {
    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'GET'
    });

    if (res.status !== 405) {
      throw new Error(`Deveria retornar 405, retornou ${res.status}`);
    }
  });

  // 7. Teste de Re-envio com mesmo e-mail (Deduplicação / Múltiplas solicitações)
  await assertTest('7. Novo Lead criado para nova solicitação com mesmo e-mail', async () => {
    const payload = {
      nome: 'Lead Integração Teste Segunda Demanda',
      empresa: 'EMPRESA TESTE SITE VERTICE',
      cargo: 'Diretor de Operações',
      whatsapp: '(81) 98888-7777',
      email: 'lead.teste@verticeconsultoria.com.br',
      servico: 'Desenvolvimento de Líderes',
      desafio: 'Segunda solicitação comercial do mesmo cliente',
      source: 'Site'
    };

    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.status !== 200) {
      throw new Error(`Deveria aceitar nova solicitação com 200, retornou ${res.status}`);
    }
  });

  console.log(`\n=== RESUMO DOS TESTES: ${passed} passaram | ${failed} falharam ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Falha geral:', err);
  process.exit(1);
});
