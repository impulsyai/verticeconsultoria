/**
 * Vértice — Pessoas & Estratégia
 * Proxy server-side para a ingestão pública do Vértice Hub.
 *
 * O navegador envia os dois formulários para /api/lead. Esta função mantém o
 * segredo de integração no servidor e encaminha JSON ou multipart/form-data
 * para o Hub, sem expor credenciais de backend ao site público.
 */

const MAX_BODY_BYTES = 12 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = Number.parseInt(process.env.RATE_LIMIT_MAX || '30', 10);
const rateLimitMap = new Map();

function header(req, name) {
  const headers = req.headers || {};
  return headers[name.toLowerCase()] || headers[name] || '';
}

function clientIp(req) {
  return String(header(req, 'x-forwarded-for')).split(',')[0].trim() ||
    String(header(req, 'x-real-ip')).trim() ||
    'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (rateLimitMap.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return true;

  recent.push(now);
  rateLimitMap.set(ip, recent);

  if (rateLimitMap.size > 2000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return false;
}

function send(res, status, body) {
  return res.status(status).json(body);
}

function requestBodyObject(req) {
  if (!req.body || typeof req.body !== 'object' || Buffer.isBuffer(req.body)) return null;
  if (req.body instanceof Uint8Array) return null;
  return req.body;
}

async function readRawBody(req) {
  if (req.rawBody) return Buffer.from(req.rawBody);
  if (Buffer.isBuffer(req.body)) return req.body;
  if (req.body instanceof Uint8Array) return Buffer.from(req.body);

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error('payload_too_large');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function parseMultipart(rawBody, contentType) {
  if (typeof Request !== 'function' || typeof FormData !== 'function') {
    throw new Error('multipart_not_supported');
  }

  const parsed = await new Request('http://site-intake.local', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: rawBody,
  }).formData();

  const honeypot = parsed.get('website_url_hp');
  if (typeof honeypot === 'string' && honeypot.trim()) {
    return { honeypot: true, body: null, headers: {} };
  }

  const forwarded = new FormData();
  for (const [key, value] of parsed.entries()) {
    if (typeof value === 'string') forwarded.append(key, value);
    else forwarded.append(key, value, value.name || 'curriculo');
  }

  return { honeypot: false, body: forwarded, headers: {} };
}

async function buildForwardPayload(req) {
  const contentType = String(header(req, 'content-type')).toLowerCase();
  if (contentType.startsWith('multipart/form-data')) {
    const rawBody = await readRawBody(req);
    if (rawBody.length > MAX_BODY_BYTES) throw new Error('payload_too_large');
    return parseMultipart(rawBody, header(req, 'content-type'));
  }

  const objectBody = requestBodyObject(req);
  if (objectBody) {
    if (String(objectBody.website_url_hp || '').trim()) return { honeypot: true, body: null, headers: {} };
    return { honeypot: false, body: JSON.stringify(objectBody), headers: { 'content-type': 'application/json' } };
  }

  if (typeof req.body === 'string' && contentType.includes('application/json')) {
    const parsed = JSON.parse(req.body);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_json');
    if (String(parsed.website_url_hp || '').trim()) return { honeypot: true, body: null, headers: {} };
    return { honeypot: false, body: JSON.stringify(parsed), headers: { 'content-type': 'application/json' } };
  }

  const rawBody = await readRawBody(req);
  if (rawBody.length > MAX_BODY_BYTES) throw new Error('payload_too_large');
  if (!rawBody.length) return { honeypot: false, body: JSON.stringify({}), headers: { 'content-type': 'application/json' } };

  if (contentType.includes('application/json')) {
    const parsed = JSON.parse(rawBody.toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_json');
    if (String(parsed.website_url_hp || '').trim()) return { honeypot: true, body: null, headers: {} };
    return { honeypot: false, body: JSON.stringify(parsed), headers: { 'content-type': 'application/json' } };
  }

  throw new Error('unsupported_content_type');
}

function normalizeHubResponse(payload) {
  const data = payload && typeof payload === 'object' && payload.data ? payload.data : payload;
  if (data && data.success) return { success: true, ...data };

  const error = payload && typeof payload === 'object' && payload.error;
  return {
    success: false,
    error: typeof error === 'string' ? error : error?.code || 'hub_unavailable',
    message: typeof error === 'object' ? error.message : payload?.message || 'Não foi possível concluir o envio.',
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { success: false, error: 'method_not_allowed' });
  }

  if (isRateLimited(clientIp(req))) {
    return send(res, 429, { success: false, error: 'rate_limited', message: 'Tente novamente em alguns instantes.' });
  }

  const hubUrl = process.env.HUB_API_URL || 'http://localhost:3000/api/v1/public/site-intake';
  const integrationSecret = String(process.env.SITE_INTAKE_SHARED_SECRET || '').trim();
  if (!integrationSecret) {
    console.error('[SITE INTAKE] SITE_INTAKE_SHARED_SECRET não configurado.');
    return send(res, 503, { success: false, error: 'integration_not_configured' });
  }

  try {
    const parsedUrl = new URL(hubUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('invalid_hub_url');

    const payload = await buildForwardPayload(req);
    if (payload.honeypot) return send(res, 200, { success: true, message: 'Recebido.' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let hubResponse;
    try {
      hubResponse = await fetch(parsedUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'x-site-intake-secret': integrationSecret,
          ...payload.headers,
        },
        body: payload.body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const responseBody = await hubResponse.json().catch(() => ({}));
    const normalized = normalizeHubResponse(responseBody);
    return send(res, hubResponse.ok ? 200 : hubResponse.status, normalized);
  } catch (error) {
    const code = error?.message || 'unknown_error';
    if (code === 'payload_too_large') {
      return send(res, 413, { success: false, error: 'payload_too_large', message: 'O arquivo enviado excede o limite permitido.' });
    }
    if (code === 'invalid_json' || code === 'unsupported_content_type' || code === 'multipart_not_supported') {
      return send(res, 400, { success: false, error: code });
    }
    if (error?.name === 'AbortError') {
      return send(res, 504, { success: false, error: 'hub_timeout', message: 'O Hub demorou para responder.' });
    }
    console.error('[SITE INTAKE] Falha ao encaminhar para o Hub:', error);
    return send(res, 502, { success: false, error: 'hub_unavailable', message: 'Não foi possível conectar ao Hub.' });
  }
};
