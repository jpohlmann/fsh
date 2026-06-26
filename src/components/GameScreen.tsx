import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/useGame';
import { playBloop, playSplash } from '../sounds/sounds';
import { theme, fonts } from '../theme';
import { ClueDisplay } from './ClueDisplay';
import { GuessSlots } from './GuessSlots';
import { Lake } from './Lake';
import { PaperBackground } from './PaperBackground';

type Props = {
  game: ReturnType<typeof useGame>;
};

export function GameScreen({ game }: Props) {
  const {
    wordIndex,
    currentPuzzle,
    letters,
    guess,
    phase,
    countdown,
    revealed,
    selectLetter,
    clearSlot,
    totalWords,
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

  if (!currentPuzzle) return null;

  const handleLetterPress = (id: string) => {
    const picked = selectLetter(id);
    if (picked) playBloop();
  };

  const revealNote = revealed ? (
    <Text style={styles.revealNote}>
      {results[results.length - 1]?.guessed
        ? 'Nice catch!'
        : `It was ${currentPuzzle.word.toUpperCase()}`}
    </Text>
  ) : null;

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
          <ClueDisplay
            clue={currentPuzzle.clue}
            wordNumber={wordIndex + 1}
            totalWords={totalWords}
            bottom
          />
          <GuessSlots
            guess={guess}
            revealed={revealed}
            answer={currentPuzzle.word.toUpperCase()}
            onSlotPress={clearSlot}
            compact
          />
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
    alignItems: 'center',
    gap: 2,
    overflow: 'visible',
  },
  revealNote: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: theme.inkLight,
    textAlign: 'center',
  },
  revealNoteSlot: {
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
