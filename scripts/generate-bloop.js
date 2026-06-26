/**
 * Generates assets/sounds/bloop.wav
 *
 * Soft underwater "bloop" — pitch rises low → high like a rising bubble.
 * Inspired by bubble foley such as Epidemic Sound's bubble pop library:
 * https://www.epidemicsound.com/sound-effects/tracks/194d1762-fcad-4fde-a342-db79c4b1a877/
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 0.18;

function synthesizeBubblePop() {
  const length = Math.floor(SAMPLE_RATE * DURATION);
  const samples = new Float32Array(length);

  let phase1 = 0;
  let phase2 = 0;
  let lpNoise = 0;

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;

    // Gentle swell in, soft fade out
    const attack = 1 - Math.exp(-t * 180);
    const decay = Math.exp(-t * 16);
    const env = attack * decay;

    // Low → high pitch sweep ("bloo…p")
    const rise = 1 - Math.exp(-t * 42);
    const freq = 130 + 340 * rise;

    phase1 += (2 * Math.PI * freq) / SAMPLE_RATE;
    phase2 += (2 * Math.PI * freq * 1.6) / SAMPLE_RATE;

    const membrane = Math.sin(phase1) * 0.32 + Math.sin(phase2) * 0.04;

    // Very subtle wet texture
    const white = Math.random() * 2 - 1;
    lpNoise = lpNoise * 0.7 + white * 0.3;
    const clickEnv = Math.exp(-t * 120);
    const click = lpNoise * clickEnv * 0.05;

    samples[i] = (membrane * env + click) * 0.75;
  }

  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const gain = 0.7 / peak;
  for (let i = 0; i < samples.length; i++) samples[i] *= gain;

  return samples;
}

function writeWav(filePath, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    buffer.writeInt16LE(Math.round(int16), 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

const outPath = path.join(__dirname, '../assets/sounds/bloop.wav');
writeWav(outPath, synthesizeBubblePop());
console.log(`Wrote ${outPath}`);
