import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFreestyleGame } from '../game/useFreestyleGame';
import { formatWeightLbs } from '../game/scoring';
import { playBloop, playSplash } from '../sounds/sounds';
import { theme, fonts } from '../theme';
import { Lake } from './Lake';
import { PaperBackground } from './PaperBackground';
import { SketchButton } from './SketchButton';
import { WordGuess } from './WordGuess';

type Props = {
  game: ReturnType<typeof useFreestyleGame>;
};

export function FreestyleGameScreen({ game }: Props) {
  const {
    roundIndex,
    letters,
    guess,
    phase,
    countdown,
    revealed,
    selectLetter,
    clearSlot,
    submitWord,
    submitError,
    totalRounds,
    results,
    lakeShape,
  } = game;

  const lastSplashRef = useRef(-1);

  useEffect(() => {
    if (!revealed) return;
    const last = results[results.length - 1];
    if (last?.guessed && results.length - 1 !== lastSplashRef.current) {
      lastSplashRef.current = results.length - 1;
      playSplash();
    }
  }, [revealed, results]);

  const handleLetterPress = (id: string) => {
    const picked = selectLetter(id);
    if (picked) playBloop();
  };

  const lastResult = results[results.length - 1];
  const revealNote = revealed ? (
    <Text style={styles.revealNote}>
      {lastResult?.guessed
        ? `Nice catch! ${formatWeightLbs(lastResult.weightLbs)}`
        : 'Time ran out — no points'}
    </Text>
  ) : submitError ? (
    <Text style={styles.errorNote}>{submitError}</Text>
  ) : null;

  const canSubmit = guess.length >= 3 && !revealed && phase !== 'reveal';

  return (
    <PaperBackground>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Fsh</Text>
          {phase === 'final-countdown' && !revealed && (
            <Text style={styles.countdown}>{countdown}s</Text>
          )}
        </View>

        <View style={styles.lakeArea}>
          <Lake
            shape={lakeShape}
            letters={letters}
            onLetterPress={handleLetterPress}
            compact
          />
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.hint}>
            {roundIndex + 1} / {totalRounds} · Spell the longest word you can
          </Text>
          <View style={styles.playRow}>
            <WordGuess
              guess={guess}
              revealed={revealed}
              onSlotPress={clearSlot}
              compact
            />
            {canSubmit && (
              <SketchButton label="Submit" onPress={submitWord} compact />
            )}
          </View>
          <View style={styles.revealNoteSlot}>{revealNote}</View>
        </View>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    flexShrink: 0,
  },
  title: {
    fontFamily: fonts.hand,
    fontSize: 32,
    color: theme.ink,
  },
  countdown: {
    fontFamily: fonts.hand,
    fontSize: 22,
    color: theme.ink,
  },
  lakeArea: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 8,
    overflow: 'visible',
  },
  bottomBar: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    alignItems: 'stretch',
    gap: 4,
    overflow: 'visible',
  },
  hint: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: theme.inkLight,
    textAlign: 'center',
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  revealNote: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: theme.inkLight,
    textAlign: 'center',
  },
  errorNote: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: theme.ink,
    textAlign: 'center',
  },
  revealNoteSlot: {
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
