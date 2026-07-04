#!/usr/bin/env node
/**
 * Upload a day's puzzles to the Fsh API (EC2 micro or local server).
 *
 * Usage:
 *   FSH_API_URL=https://... FSH_ADMIN_API_KEY=... node scripts/put-daily-puzzles.js 2026-06-27 puzzles/daily.json
 *
 * puzzles JSON shape:
 *   { "puzzles": [ { "clue": "...", "word": "OCEAN" }, ... ] }   // exactly 5
 * or a bare array of 5 puzzle objects.
 */

const fs = require('fs');
const path = require('path');

const apiUrl = process.env.FSH_API_URL?.replace(/\/$/, '');
const adminKey = process.env.FSH_ADMIN_API_KEY;

function usage() {
  console.error('Usage: FSH_API_URL=... FSH_ADMIN_API_KEY=... node scripts/put-daily-puzzles.js <YYYY-MM-DD> <puzzles.json>');
  process.exit(1);
}

const [date, filePath] = process.argv.slice(2);
if (!date || !filePath || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  usage();
}
if (!apiUrl || !adminKey) {
  console.error('Set FSH_API_URL and FSH_ADMIN_API_KEY environment variables.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
const puzzles = Array.isArray(raw) ? raw : raw.puzzles;
if (!Array.isArray(puzzles)) {
  console.error('File must contain a puzzles array or be an array of puzzles.');
  process.exit(1);
}

async function main() {
  const res = await fetch(`${apiUrl}/admin/daily`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
    },
    body: JSON.stringify({ date, puzzles }),
  });

  const body = await res.json();
  if (!res.ok) {
    console.error(`Upload failed (${res.status}):`, body.error ?? body);
    process.exit(1);
  }

  console.log(`Uploaded ${date}:`);
  for (const p of body.puzzles) {
    console.log(`  ${p.word} — ${p.clue}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
