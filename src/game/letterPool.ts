import { placeLettersInLake } from './letterPlacement';
import { LakeShape } from './lakeShapes';
import { LakeLetter } from './types';

const DECOY_LETTERS = 'BCDFGHJKLMNPQRSTVWXYZ';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateDecoys(word: string, count: number): string[] {
  const wordSet = new Set(word.toUpperCase().split(''));
  const pool = DECOY_LETTERS.split('').filter((c) => !wordSet.has(c));
  const decoys: string[] = [];
  for (let i = 0; i < count; i++) {
    decoys.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return decoys;
}

export function createLakeLetters(word: string, shape: LakeShape): LakeLetter[] {
  const upper = word.toUpperCase();
  const wordLetters = upper.split('');
  const decoyCount =
    wordLetters.length <= 4 ? 4 : wordLetters.length <= 6 ? 3 : 3;
  const allChars = shuffle([...wordLetters, ...generateDecoys(upper, decoyCount)]);
  const positions = placeLettersInLake(shape, allChars.length);

  return allChars.map((char, index) => {
    const isInWord = wordLetters.includes(char);
    const pos = positions[index];
    return {
      id: `${index}-${char}-${Math.random().toString(36).slice(2, 6)}`,
      char,
      isInWord,
      x: pos.x,
      y: pos.y,
      bobOffset: Math.random() * Math.PI * 2,
      sunk: false,
      used: false,
    };
  });
}
