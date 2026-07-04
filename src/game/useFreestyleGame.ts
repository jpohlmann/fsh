import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidWord } from './dictionary';
import { createFreestyleLakeLetters, pickLetterPool } from './freestyleLetterPool';
import { LakeShape, pickLakeShape } from './lakeShapes';
import { weightForWordLength } from './scoring';
import {
  FINAL_COUNTDOWN_SEC,
  FREESTYLE_MIN_LETTERS,
  FreestyleResult,
  LakeLetter,
  RoundPhase,
  FREESTYLE_SINK_INTERVAL_MS,
  WORDS_PER_ROUND,
} from './types';

type GameScreen = 'start' | 'playing' | 'results';

type GuessSlot = {
  char: string;
  letterId: string;
};

export function useFreestyleGame() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [roundIndex, setRoundIndex] = useState(0);
  const [letters, setLetters] = useState<LakeLetter[]>([]);
  const [guess, setGuess] = useState<GuessSlot[]>([]);
  const [phase, setPhase] = useState<RoundPhase>('sinking');
  const [countdown, setCountdown] = useState(FINAL_COUNTDOWN_SEC);
  const [results, setResults] = useState<FreestyleResult[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [lakeShape, setLakeShape] = useState<LakeShape>(() => pickLakeShape());
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sinkOrderRef = useRef<string[]>([]);
  const sinkCursorRef = useRef(0);
  const guessRef = useRef<GuessSlot[]>([]);
  const sinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  guessRef.current = guess;

  const clearTimers = useCallback(() => {
    if (sinkTimerRef.current) clearInterval(sinkTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    sinkTimerRef.current = null;
    countdownTimerRef.current = null;
    advanceTimerRef.current = null;
    errorTimerRef.current = null;
  }, []);

  const initRound = useCallback(() => {
    const shape = pickLakeShape();
    const pool = pickLetterPool();
    const { letters: lakeLetters, sinkOrder } = createFreestyleLakeLetters(pool, shape);
    sinkOrderRef.current = sinkOrder;
    sinkCursorRef.current = 0;
    setLakeShape(shape);
    setLetters(lakeLetters);
    setGuess([]);
    setPhase('sinking');
    setCountdown(FINAL_COUNTDOWN_SEC);
    setRevealed(false);
    setSubmitError(null);
  }, []);

  const startRound = useCallback(() => {
    clearTimers();
    setRoundIndex(0);
    setResults([]);
    setScreen('playing');
    initRound();
  }, [clearTimers, initRound]);

  const goToMenu = useCallback(() => {
    clearTimers();
    setScreen('start');
  }, [clearTimers]);

  const finishRound = useCallback(
    (guessed: boolean, word: string) => {
      clearTimers();
      const upper = word.toUpperCase();
      const result: FreestyleResult = {
        word: upper,
        guessed,
        weightLbs: guessed ? weightForWordLength(upper.length) : 0,
      };

      setResults((prev) => [...prev, result]);
      setRevealed(true);
      setPhase('reveal');

      advanceTimerRef.current = setTimeout(() => {
        setRoundIndex((current) => {
          if (current + 1 >= WORDS_PER_ROUND) {
            setScreen('results');
            return current;
          }
          initRound();
          return current + 1;
        });
      }, 2000);
    },
    [clearTimers, initRound],
  );

  const selectLetter = useCallback(
    (letterId: string) => {
      if (revealed || phase === 'reveal') return null;

      const letter = letters.find((l) => l.id === letterId);
      if (!letter || letter.sunk || letter.used) return null;

      setGuess((prev) => [...prev, { char: letter.char, letterId: letter.id }]);
      setLetters((prev) =>
        prev.map((l) => (l.id === letterId ? { ...l, used: true } : l)),
      );
      setSubmitError(null);
      return letter.char;
    },
    [letters, phase, revealed],
  );

  const clearSlot = useCallback(
    (slotIndex: number) => {
      if (revealed) return;

      const slot = guess[slotIndex];
      if (!slot) return;

      setGuess((prev) => prev.filter((_, i) => i !== slotIndex));
      setLetters((prev) =>
        prev.map((l) => (l.id === slot.letterId ? { ...l, used: false } : l)),
      );
      setSubmitError(null);
    },
    [guess, revealed],
  );

  const submitWord = useCallback(() => {
    if (revealed || phase === 'reveal') return;

    const attempt = guess.map((s) => s.char).join('');
    if (attempt.length < 3) {
      setSubmitError('Use at least 3 letters');
      return;
    }

    if (!isValidWord(attempt)) {
      setSubmitError('Not a word');
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setSubmitError(null), 2000);
      return;
    }

    finishRound(true, attempt);
  }, [finishRound, guess, phase, revealed]);

  const sinkNextLetter = useCallback(() => {
    setLetters((prev) => {
      const order = sinkOrderRef.current;
      let cursor = sinkCursorRef.current;

      while (cursor < order.length) {
        const candidateId = order[cursor];
        cursor += 1;
        const letter = prev.find((l) => l.id === candidateId);
        if (letter && !letter.sunk && !letter.used) {
          sinkCursorRef.current = cursor;
          return prev.map((l) => (l.id === candidateId ? { ...l, sunk: true } : l));
        }
      }

      sinkCursorRef.current = cursor;
      return prev;
    });
  }, []);

  const floatingCount = letters.filter((l) => !l.sunk).length;

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'sinking' || revealed) return;
    if (floatingCount <= FREESTYLE_MIN_LETTERS) {
      setPhase('final-countdown');
    }
  }, [screen, phase, revealed, floatingCount]);

  useEffect(() => {
    if (screen !== 'playing' || phase !== 'sinking' || revealed) return;

    sinkTimerRef.current = setInterval(sinkNextLetter, FREESTYLE_SINK_INTERVAL_MS);
    return () => {
      if (sinkTimerRef.current) clearInterval(sinkTimerRef.current);
    };
  }, [screen, phase, revealed, roundIndex, sinkNextLetter]);

  useEffect(() => {
    if (phase !== 'final-countdown' || revealed) return;

    setCountdown(FINAL_COUNTDOWN_SEC);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          const attempt = guessRef.current.map((s) => s.char).join('');
          finishRound(false, attempt || '—');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [phase, revealed, roundIndex, finishRound]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const guessChars = guess.map((s) => s.char);

  return {
    screen,
    startRound,
    goToMenu,
    roundIndex,
    letters,
    guess: guessChars,
    phase,
    countdown,
    results,
    revealed,
    selectLetter,
    clearSlot,
    submitWord,
    submitError,
    totalRounds: WORDS_PER_ROUND,
    lakeShape,
  };
}
