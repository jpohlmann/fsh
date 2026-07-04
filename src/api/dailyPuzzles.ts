import { Puzzle } from '../game/types';
import { getApiUrl } from './config';

export class DailyPuzzleError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'DailyPuzzleError';
  }
}

type DailyResponse = {
  date: string;
  puzzles: Puzzle[];
};

export function localDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDailyLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export async function fetchDailyPuzzles(date = localDateString()): Promise<DailyResponse> {
  const base = getApiUrl();
  if (!base) {
    throw new DailyPuzzleError('API URL not configured');
  }

  const url = `${base}/daily?date=${encodeURIComponent(date)}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new DailyPuzzleError('Could not reach the puzzle server');
  }

  let body: { error?: string; date?: string; puzzles?: Puzzle[] } = {};
  try {
    body = await res.json();
  } catch {
    throw new DailyPuzzleError('Invalid response from puzzle server', res.status);
  }

  if (!res.ok) {
    throw new DailyPuzzleError(body.error ?? `Request failed (${res.status})`, res.status);
  }

  if (!body.date || !Array.isArray(body.puzzles) || body.puzzles.length !== 5) {
    throw new DailyPuzzleError('Invalid puzzle data from server', res.status);
  }

  return { date: body.date, puzzles: body.puzzles };
}
