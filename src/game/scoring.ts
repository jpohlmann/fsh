import { FishSize } from './types';

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function fishSizeForTime(timeMs: number, wordLength: number): FishSize {
  const seconds = timeMs / 1000;
  const base = wordLength * 2;

  if (seconds <= base) return 'whale';
  if (seconds <= base + 4) return 'large';
  if (seconds <= base + 8) return 'medium';
  if (seconds <= base + 14) return 'small';
  return 'tiny';
}

/** Heavier catch for faster solves; scales with word length. Returns 0 if missed. */
export function fishWeightLbs(timeMs: number, wordLength: number, guessed: boolean): number {
  if (!guessed) return 0;

  const seconds = Math.max(timeMs / 1000, 0.3);
  const parSeconds = wordLength * 2;
  const cap = wordLength * 2.6 + 2;
  const floor = 0.4;

  if (seconds <= parSeconds) {
    const quickness = 1 - (seconds / parSeconds) * 0.12;
    return round1(cap * quickness);
  }

  const over = seconds - parSeconds;
  const penalty = over / (wordLength * 2.8);
  const factor = Math.max(floor / cap, 0.88 - penalty * 0.75);
  return round1(Math.max(floor, cap * factor));
}

export function formatWeightLbs(lbs: number) {
  return `${lbs.toFixed(1)} lb`;
}

export function totalWeightLbs(results: { weightLbs: number }[]) {
  return round1(results.reduce((sum, r) => sum + r.weightLbs, 0));
}

export const FISH_DIMENSIONS: Record<FishSize, { width: number; height: number }> = {
  tiny: { width: 28, height: 14 },
  small: { width: 38, height: 18 },
  medium: { width: 50, height: 24 },
  large: { width: 64, height: 30 },
  whale: { width: 80, height: 38 },
};

const MIN_WEIGHT_LBS = 0.4;
const MAX_WEIGHT_LBS = 23;

/** Map catch weight to pixel dimensions — continuous, not tiered. */
export function fishDimensionsForWeight(weightLbs: number, guessed: boolean) {
  if (!guessed || weightLbs <= 0) return FISH_DIMENSIONS.tiny;

  const minFish = FISH_DIMENSIONS.tiny;
  const maxFish = FISH_DIMENSIONS.whale;
  const t = Math.min(
    1,
    Math.max(0, (weightLbs - MIN_WEIGHT_LBS) / (MAX_WEIGHT_LBS - MIN_WEIGHT_LBS)),
  );

  return {
    width: Math.round(minFish.width + t * (maxFish.width - minFish.width)),
    height: Math.round(minFish.height + t * (maxFish.height - minFish.height)),
  };
}
