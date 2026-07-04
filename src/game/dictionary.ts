import wordList from './wordList.json';

const WORDS = wordList as string[];
const WORD_SET = new Set(WORDS);

const wordsByLength: string[][] = [];
for (const word of WORDS) {
  const len = word.length;
  if (!wordsByLength[len]) wordsByLength[len] = [];
  wordsByLength[len].push(word);
}

export function isValidWord(word: string): boolean {
  return WORD_SET.has(word.toLowerCase());
}

export function letterCounts(chars: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of chars) {
    const upper = c.toUpperCase();
    counts.set(upper, (counts.get(upper) ?? 0) + 1);
  }
  return counts;
}

export function canFormWord(word: string, available: Map<string, number>): boolean {
  const needed = letterCounts(word.split(''));
  for (const [char, count] of needed) {
    if ((available.get(char) ?? 0) < count) return false;
  }
  return true;
}

/** All dictionary words formable from the given letter multiset. */
export function findFormableWords(chars: string[]): string[] {
  if (chars.length < 3) return [];
  const available = letterCounts(chars);
  const results: string[] = [];
  const maxLen = Math.min(chars.length, 10);

  for (let len = 3; len <= maxLen; len++) {
    const bucket = wordsByLength[len];
    if (!bucket) continue;
    for (const word of bucket) {
      if (canFormWord(word, available)) results.push(word);
    }
  }
  return results;
}

/** Fast check — stops at the first formable word found. */
export function hasFormableWord(chars: string[]): boolean {
  if (chars.length < 3) return false;
  const available = letterCounts(chars);
  const maxLen = Math.min(chars.length, 10);

  for (let len = 3; len <= maxLen; len++) {
    const bucket = wordsByLength[len];
    if (!bucket) continue;
    for (const word of bucket) {
      if (canFormWord(word, available)) return true;
    }
  }
  return false;
}

export function poolHasWordTiers(chars: string[]): boolean {
  const available = letterCounts(chars);
  let hasShort = false;
  let hasMedium = false;
  let hasLong = false;
  const maxLen = Math.min(chars.length, 10);

  for (let len = 3; len <= maxLen; len++) {
    const bucket = wordsByLength[len];
    if (!bucket) continue;
    for (const word of bucket) {
      if (!canFormWord(word, available)) continue;
      if (len <= 4) hasShort = true;
      else if (len <= 6) hasMedium = true;
      else hasLong = true;
      if (hasShort && hasMedium && hasLong) return true;
    }
  }
  return false;
}
