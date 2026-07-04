import { Puzzle } from './types';

export const PUZZLES: Puzzle[] = [
  { clue: 'A large body of salt water', word: 'OCEAN' },
  { clue: 'You read these for stories', word: 'BOOKS' },
  { clue: 'Falls from clouds', word: 'RAIN' },
  { clue: 'A furry pet that meows', word: 'CAT' },
  { clue: 'Bright star in our sky', word: 'SUN' },
  { clue: 'Frozen water', word: 'ICE' },
  { clue: 'You sleep in it at night', word: 'BED' },
  { clue: 'Green plant in the ground', word: 'TREE' },
  { clue: 'Opposite of cold', word: 'HOT' },
  { clue: 'You write with it', word: 'PEN' },
  { clue: 'Sweet yellow fruit', word: 'BANANA' },
  { clue: 'King of the jungle', word: 'LION' },
  { clue: 'Shines at night', word: 'MOON' },
  { clue: 'You wear these on your feet', word: 'SHOES' },
  { clue: 'Color of grass', word: 'GREEN' },
  { clue: 'Baby dog', word: 'PUPPY' },
  { clue: 'Flying insect that makes honey', word: 'BEE' },
  { clue: 'Round sports ball sport', word: 'SOCCER' },
  { clue: 'Opposite of day', word: 'NIGHT' },
  { clue: 'Frozen dessert on a stick', word: 'POPSICLE' },
];

/** Offline fallback when the daily API is unavailable (local dev). */
export function pickRoundPuzzles(count: number): Puzzle[] {
  const shuffled = [...PUZZLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
