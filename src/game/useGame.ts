import { useCallback, useEffect, useRef, useState } from 'react';
import { createLakeLetters } from './letterPool';
import { LakeShape, pickLakeShape } from './lakeShapes';
import { fishSizeForTime, fishWeightLbs } from './scoring';
import {
  FINAL_COUNTDOWN_SEC,
  LakeLetter,
  Puzzle,
  RoundPhase,
  SINK_INTERVAL_MS,
  WORDS_PER_ROUND,
  WordResult,
} from './types';

type GameScreen = 'start' | 'playing' | 'results';

type GuessSlot = {
  char: string;
  letterId: string;
} | null;

export function useGame() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [letters, setLetters] = useState<LakeLetter[]>([]);
  const [guess, setGuess] = useState<GuessSlot[]>([]);
  const [phase, setPhase] = useState<RoundPhase>('sinking');
  const [countdown, setCountdown] = useState(FINAL_COUNTDOWN_SEC);
  const [results, setResults] = useState<WordResult[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [lakeShape, setLakeShape] = useState<LakeShape>(() => pickLakeShape());

  const startTimeRef = useRef(0);
  const sinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPuzzle = puzzles[wordIndex];

  const clearTimers = useCallback(() => {
    if (sinkTimerRef.current) clearInterval(sinkTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    sinkTimerRef.current = null;
    countdownTimerRef.current = null;
    advanceTimerRef.current = null;
  }, []);

  const initWord = useCallback((puzzle: Puzzle) => {
    const upper = puzzle.word.toUpperCase();
    const shape = pickLakeShape();
    const lakeLetters = createLakeLetters(upper, shape);
    const initialGuess: GuessSlot[] = upper.split('').map(() => null);
    setLakeShape(shape);
    setLetters(lakeLetters);
    setGuess(initialGuess);
    setPhase('sinking');
    setCountdown(FINAL_COUNTDOWN_SEC);
    setRevealed(false);
    startTimeRef.current = Date.now();
  }, []);

  const startRound = useCallback(
    (roundPuzzles: Puzzle[]) => {
      clearTimers();
      setPuzzles(roundPuzzles);
      setWordIndex(0);
      setResults([]);
      setScreen('playing');
      initWord(roundPuzzles[0]);
    },
    [clearTimers, initWord],
  );

  const goToMenu = useCallback(() => {
    clearTimers();
    setScreen('start');
  }, [clearTimers]);

  const finishWord = useCallback(
    (guessed: boolean) => {
      if (!currentPuzzle) return;
      clearTimers();

      const timeMs = Date.now() - startTimeRef.current;
      const result: WordResult = {
        word: currentPuzzle.word.toUpperCase(),
        clue: currentPuzzle.clue,
        guessed,
        timeMs,
        fishSize: guessed
          ? fishSizeForTime(timeMs, currentPuzzle.word.length)
          : 'tiny',
        weightLbs: fishWeightLbs(timeMs, currentPuzzle.word.length, guessed),
      };

      setResults((prev) => [...prev, result]);
      setRevealed(true);
      setPhase('reveal');

      advanceTimerRef.current = setTimeout(() => {
        if (wordIndex + 1 >= WORDS_PER_ROUND) {
          setScreen('results');
        } else {
          const next = wordIndex + 1;
          setWordIndex(next);
          initWord(puzzles[next]);
        }
      }, 2000);
    },
    [clearTimers, currentPuzzle, initWord, puzzles, wordIndex],
  );

  const checkGuess = useCallback(
    (slots: GuessSlot[]) => {
      if (!currentPuzzle || revealed) return;
      const attempt = slots.map((s) => s?.char ?? '').join('');
      if (attempt.length !== currentPuzzle.word.length) return;
      if (attempt === currentPuzzle.word.toUpperCase()) {
        finishWord(true);
      }
    },
    [currentPuzzle, finishWord, revealed],
  );

  const selectLetter = useCallback(
    (letterId: string) => {
      if (!currentPuzzle || revealed || phase === 'reveal') return null;

      const letter = letters.find((l) => l.id === letterId);
      if (!letter || letter.sunk || letter.used) return null;

      const emptyIndex = guess.findIndex((g) => g === null);
      if (emptyIndex === -1) return null;

      const nextGuess = [...guess];
      nextGuess[emptyIndex] = { char: letter.char, letterId: letter.id };
      setGuess(nextGuess);
      setLetters((prev) =>
        prev.map((l) => (l.id === letterId ? { ...l, used: true } : l)),
      );
      checkGuess(nextGuess);
      return letter.char;
    },
    [checkGuess, currentPuzzle, guess, letters, phase, revealed],
  );

  const clearSlot = useCallback(
    (slotIndex: number) => {
      if (!currentPuzzle || revealed) return;

      const slot = guess[slotIndex];
      if (!slot) return;

      const nextGuess = [...guess];
      nextGuess[slotIndex] = null;
      setGuess(nextGuess);

      setLetters((prev) =>
        prev.map((l) => (l.id === slot.letterId ? { ...l, used: false } : l)),
      );
    },
    [currentPuzzle, guess, revealed],
  );

  const remainingDecoys = letters.filter((l) => !l.isInWord && !l.sunk && !l.used).length;

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'sinking' || revealed) return;
    if (remainingDecoys === 0) {
      setPhase('final-countdown');
    }
  }, [screen, phase, revealed, remainingDecoys]);

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'sinking' || revealed) return;

    sinkTimerRef.current = setInterval(() => {
      setLetters((prev) => {
        const decoys = prev.filter((l) => !l.isInWord && !l.sunk && !l.used);
        if (decoys.length === 0) return prev;
        const toSink = decoys[Math.floor(Math.random() * decoys.length)];
        return prev.map((l) => (l.id === toSink.id ? { ...l, sunk: true } : l));
      });
    }, SINK_INTERVAL_MS);

    return () => {
      if (sinkTimerRef.current) clearInterval(sinkTimerRef.current);
    };
  }, [screen, phase, revealed, wordIndex]);

  useEffect(() => {
    if (phase !== 'final-countdown' || revealed) return;

    setCountdown(FINAL_COUNTDOWN_SEC);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          finishWord(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [phase, revealed, wordIndex, finishWord]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const guessChars = guess.map((s) => s?.char ?? null);

  return {
    screen,
    startRound,
    goToMenu,
    wordIndex,
    currentPuzzle,
    letters,
    guess: guessChars,
    phase,
    countdown,
    results,
    revealed,
    selectLetter,
    clearSlot,
    totalWords: WORDS_PER_ROUND,
    lakeShape,
  };
}
