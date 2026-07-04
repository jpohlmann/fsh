#!/usr/bin/env node
/**
 * Minimal daily-puzzle API for a single EC2 micro instance.
 * No dependencies — stores one JSON file per day on disk.
 *
 * Env:
 *   PORT          (default 3000)
 *   ADMIN_API_KEY (required for PUT /admin/daily)
 *   DATA_DIR      (default ./data)
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { corsHeaders, parseDate, normalizePuzzles, readJsonBody, sendJson } = require('./lib');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_KEY = process.env.ADMIN_API_KEY ?? '';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function puzzlePath(date) {
  return path.join(DATA_DIR, `${date}.json`);
}

function readDaily(date) {
  const file = puzzlePath(date);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeDaily(date, puzzles) {
  const file = puzzlePath(date);
  const payload = {
    date,
    puzzles,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return payload;
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/daily') {
    const date = parseDate(url.searchParams.get('date'));
    if (!date) {
      sendJson(res, 400, { error: 'date query param required (YYYY-MM-DD)' });
      return;
    }

    const item = readDaily(date);
    if (!item) {
      sendJson(res, 404, { error: `no puzzles for ${date}` });
      return;
    }

    sendJson(res, 200, { date: item.date, puzzles: item.puzzles });
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/admin/daily') {
    const providedKey = req.headers['x-admin-key'];
    if (!ADMIN_KEY || providedKey !== ADMIN_KEY) {
      sendJson(res, 401, { error: 'unauthorized' });
      return;
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      sendJson(res, 400, { error: 'invalid JSON body' });
      return;
    }

    const date = parseDate(body.date);
    if (!date) {
      sendJson(res, 400, { error: 'date required (YYYY-MM-DD)' });
      return;
    }

    const parsed = normalizePuzzles(body.puzzles);
    if (parsed.error) {
      sendJson(res, 400, { error: parsed.error });
      return;
    }

    const saved = writeDaily(date, parsed.puzzles);
    sendJson(res, 200, { date: saved.date, puzzles: saved.puzzles });
    return;
  }

  sendJson(res, 404, { error: 'not found' });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error(err);
    sendJson(res, 500, { error: 'internal error' });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Fsh API listening on :${PORT} (data: ${DATA_DIR})`);
});
