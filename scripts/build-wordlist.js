const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const outPath = path.join(__dirname, '../src/game/wordList.json');

https
  .get(url, (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      const words = data
        .split(/\r?\n/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length >= 3 && w.length <= 10 && /^[a-z]+$/.test(w));
      const unique = [...new Set(words)].sort();
      fs.writeFileSync(outPath, JSON.stringify(unique));
      console.log(`Wrote ${unique.length} words to ${outPath}`);
    });
  })
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  });
