export type FishSize = 'tiny' | 'small' | 'medium' | 'large' | 'whale';

export type LakeLetter = {
  id: string;
  char: string;
  isInWord: boolean;
  x: number;
  y: number;
  bobOffset: number;
  sunk: boolean;
  used: boolean;
};

export type Puzzle = {
  clue: string;
  word: string;
};

export type WordResult = {
  word: string;
  clue: string;
  guessed: boolean;
  timeMs: number;
  fishSize: FishSize;
  weightLbs: number;
};

export type RoundPhase = 'sinking' | 'final-countdown' | 'reveal';

export const WORDS_PER_ROUND = 5;
export const FINAL_COUNTDOWN_SEC = 5;
export const SINK_INTERVAL_MS = 2200;
