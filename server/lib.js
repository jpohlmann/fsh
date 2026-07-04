const WORD_RE = /^[A-Z]+$/;

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  };
}

function parseDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }
  return value;
}

function normalizePuzzles(puzzles) {
  if (!Array.isArray(puzzles) || puzzles.length !== 5) {
    return { error: 'puzzles must be an array of exactly 5 items' };
  }

  const normalized = [];
  for (let i = 0; i < puzzles.length; i++) {
    const item = puzzles[i];
    if (!item || typeof item.clue !== 'string' || typeof item.word !== 'string') {
      return { error: `puzzles[${i}] must have clue and word strings` };
    }
    const clue = item.clue.trim();
    const word = item.word.trim().toUpperCase();
    if (!clue) {
      return { error: `puzzles[${i}].clue cannot be empty` };
    }
    if (!WORD_RE.test(word)) {
      return { error: `puzzles[${i}].word must be letters only` };
    }
    normalized.push({ clue, word });
  }

  return { puzzles: normalized };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, corsHeaders());
  res.end(JSON.stringify(body));
}

module.exports = {
  corsHeaders,
  parseDate,
  normalizePuzzles,
  readJsonBody,
  sendJson,
};
