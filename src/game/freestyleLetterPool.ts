import { hasFormableWord, poolHasWordTiers } from './dictionary';
import { placeLettersInLake } from './letterPlacement';
import { LakeShape } from './lakeShapes';
import { FREESTYLE_LETTER_COUNT, FREESTYLE_MIN_LETTERS, LakeLetter } from './types';

const VOWELS = 'AEIOU';
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';

/** Words with rich vowel/consonant mix — used as seeds for random pools. */
const SEED_WORDS = [
  'TAPESTRY',
  'PAINTERS',
  'LISTENER',
  'ORIENTAL',
  'STEALING',
  'TRAILERS',
  'STRAINED',
  'LEOPARDS',
  'CREATION',
  'RATIONAL',
  'MINSTREL',
  'PASTORAL',
  'STANDARD',
  'LEARNING',
  'STANDING',
];

const FALLBACK_POOLS: string[][] = [
  'AEIOURSTLN'.split(''),
  'AEIOUNTRSD'.split(''),
  'AEIOURSTNG'.split(''),
  'AEIOUNRSTL'.split(''),
  'AEIOURTNSD'.split(''),
  'AEIOURSTND'.split(''),
  'AEIOUNRTSL'.split(''),
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomPool(): string[] {
  const seed = SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
  const letters = seed.split('');
  while (letters.length < FREESTYLE_LETTER_COUNT) {
    const pool = Math.random() < 0.45 ? VOWELS : CONSONANTS;
    letters.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return shuffle(letters.slice(0, FREESTYLE_LETTER_COUNT));
}

export function pickLetterPool(): string[] {
  for (let attempt = 0; attempt < 40; attempt++) {
    const pool = randomPool();
    if (poolHasWordTiers(pool)) return pool;
  }
  return FALLBACK_POOLS[Math.floor(Math.random() * FALLBACK_POOLS.length)];
}

/** Letters to sink, in order, while keeping at least one valid word until min letters remain. */
export function computeSinkOrder(letters: LakeLetter[]): string[] {
  let remaining = letters.map((l) => ({ id: l.id, char: l.char }));
  const order: string[] = [];

  while (remaining.length > FREESTYLE_MIN_LETTERS) {
    const sinkable = remaining.filter((letter) => {
      const nextChars = remaining
        .filter((l) => l.id !== letter.id)
        .map((l) => l.char);
      return hasFormableWord(nextChars);
    });

    if (sinkable.length === 0) break;

    const pick = sinkable[Math.floor(Math.random() * sinkable.length)];
    order.push(pick.id);
    remaining = remaining.filter((l) => l.id !== pick.id);
  }

  return order;
}

export function createFreestyleLakeLetters(
  chars: string[],
  shape: LakeShape,
): { letters: LakeLetter[]; sinkOrder: string[] } {
  const positions = placeLettersInLake(shape, chars.length);
  const letters = chars.map((char, index) => {
    const pos = positions[index];
    return {
      id: `${index}-${char}-${Math.random().toString(36).slice(2, 6)}`,
      char,
      isInWord: true,
      x: pos.x,
      y: pos.y,
      bobOffset: Math.random() * Math.PI * 2,
      sunk: false,
      used: false,
    };
  });

  return { letters, sinkOrder: computeSinkOrder(letters) };
}
