/**
 * Vértice — Pessoas & Estratégia
 * Servidor Local de Desenvolvimento e Emulação de Vercel Serverless Functions
 *
 * Permite rodar o site localmente e executar /api/lead com roteamento para o Frappe CRM local.
 * Uso: node dev-server.js (ou via npm/powershell)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 1. Carregador simples de arquivo .env local sem dependências externas
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
  console.log('[DEV-SERVER] .env carregado com sucesso.');
} else {
  console.warn('[DEV-SERVER] Aviso: Arquivo .env não encontrado em site/. Usando padrões de ambiente.');
}

const leadHandler = require('./api/lead.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Adapter simples para emular res.status(code).json(body) compatível com Vercel
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    if (!this.getHeader('Content-Type')) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    this.end(JSON.stringify(data));
    return this;
  };

  // Roteamento da Serverless Function /api/lead
  if (pathname === '/api/lead') {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });
    req.on('end', async () => {
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch (e) {
        req.body = rawBody;
      }
      try {
        await leadHandler(req, res);
      } catch (err) {
        console.error('[DEV-SERVER] Erro no handler de /api/lead:', err);
        if (!res.writableEnded) {
          res.status(500).json({ success: false, error: 'internal_server_error' });
        }
      }
    });
    return;
  }

  // Arquivos Estáticos
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Vértice B2B rodando em: http://localhost:${PORT}`);
  console.log(`📡 Endpoint de Lead ativo em: http://localhost:${PORT}/api/lead`);
  console.log(`🔗 Destino Frappe CRM: ${process.env.FRAPPE_BASE_URL || 'http://localhost:8000'}`);
  console.log(`====================================================`);
});
