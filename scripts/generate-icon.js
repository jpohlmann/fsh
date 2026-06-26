/**
 * Generates iOS/Android icon PNGs from the outline fish on the score screen.
 *
 * Usage: node scripts/generate-icon.js
 */

const fs = require('fs');
const path = require('path');

const INK = '#2B4C7E';
const PAPER = '#F7F3E8';
const SIZE = 1024;
const FISH_SCALE = 7.2;
const STROKE = 1.6;

function fishMarkup() {
  return `
    <g transform="translate(${SIZE / 2}, ${SIZE / 2}) scale(${FISH_SCALE}) translate(-40, -20)">
      <ellipse
        cx="38"
        cy="20"
        rx="28"
        ry="14"
        stroke="${INK}"
        stroke-width="${STROKE}"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 10 20 L 0 10 L 0 30 Z"
        stroke="${INK}"
        stroke-width="${STROKE}"
        fill="none"
        stroke-linejoin="round"
      />
      <path
        d="M 55 14 L 61 20 M 61 14 L 55 20"
        stroke="${INK}"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
      />
    </g>
  `;
}

function buildSvg(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${PAPER}" />
  ${fishMarkup()}
</svg>`;
}

async function main() {
  const sharp = require('sharp');
  const assetsDir = path.join(__dirname, '../assets');
  const svg = Buffer.from(buildSvg(SIZE));

  const iconPath = path.join(assetsDir, 'icon.png');
  await sharp(svg).png().toFile(iconPath);
  console.log(`Wrote ${iconPath}`);

  const splashPath = path.join(assetsDir, 'splash-icon.png');
  await sharp(svg).resize(512, 512).png().toFile(splashPath);
  console.log(`Wrote ${splashPath}`);

  const faviconPath = path.join(assetsDir, 'favicon.png');
  await sharp(svg).resize(48, 48).png().toFile(faviconPath);
  console.log(`Wrote ${faviconPath}`);

  const androidPath = path.join(assetsDir, 'android-icon-foreground.png');
  await sharp(svg).resize(1024, 1024).png().toFile(androidPath);
  console.log(`Wrote ${androidPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
