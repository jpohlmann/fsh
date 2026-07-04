import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFonts, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { StatusBar } from 'expo-status-bar';
import { isDailyApiConfigured } from './src/api/config';
import { DailyPuzzleError, fetchDailyPuzzles, formatDailyLabel, localDateString } from './src/api/dailyPuzzles';
import { FreestyleGameScreen } from './src/components/FreestyleGameScreen';
import { FreestyleResultsScreen } from './src/components/FreestyleResultsScreen';
import { GameScreen } from './src/components/GameScreen';
import { ResultsScreen } from './src/components/ResultsScreen';
import { StartScreen } from './src/components/StartScreen';
import { GameMode, WORDS_PER_ROUND } from './src/game/types';
import { pickRoundPuzzles } from './src/game/words';
import { useFreestyleGame } from './src/game/useFreestyleGame';
import { useGame } from './src/game/useGame';
import { theme, fonts } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({ Caveat_700Bold });
  const [mode, setMode] = useState<GameMode>('clue');
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [dailyDateLabel, setDailyDateLabel] = useState(() =>
    formatDailyLabel(localDateString()),
  );
  const clueGame = useGame();
  const freestyleGame = useFreestyleGame();

  const handleStart = useCallback(
    async (selectedMode: GameMode) => {
      setMode(selectedMode);
      if (selectedMode === 'clue') {
        setDailyError(null);
        if (isDailyApiConfigured()) {
          setDailyLoading(true);
          try {
            const { date, puzzles } = await fetchDailyPuzzles();
            setDailyDateLabel(formatDailyLabel(date));
            clueGame.startRound(puzzles);
          } catch (err) {
            const message =
              err instanceof DailyPuzzleError
                ? err.message
                : 'Could not load today\'s puzzles';
            setDailyError(message);
          } finally {
            setDailyLoading(false);
          }
        } else {
          clueGame.startRound(pickRoundPuzzles(WORDS_PER_ROUND));
        }
      } else {
        freestyleGame.startRound();
      }
    },
    [clueGame, freestyleGame],
  );

  const handleBackToMenu = useCallback(() => {
    clueGame.goToMenu();
    freestyleGame.goToMenu();
    setDailyError(null);
  }, [clueGame, freestyleGame]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.ink} />
      </View>
    );
  }

  const onStartScreen =
    clueGame.screen === 'start' && freestyleGame.screen === 'start';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {onStartScreen && (
        <StartScreen
          onStart={handleStart}
          dailyDateLabel={isDailyApiConfigured() ? dailyDateLabel : undefined}
          dailyLoading={dailyLoading}
          dailyError={dailyError}
          onDismissError={() => setDailyError(null)}
        />
      )}
      {dailyLoading && onStartScreen && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.ink} size="large" />
          <Text style={styles.loadingText}>Loading today&apos;s catch…</Text>
        </View>
      )}
      {mode === 'clue' && clueGame.screen === 'playing' && <GameScreen game={clueGame} />}
      {mode === 'clue' && clueGame.screen === 'results' && (
        <ResultsScreen
          results={clueGame.results}
          onPlayAgain={() => handleStart('clue')}
          onBackToMenu={handleBackToMenu}
        />
      )}
      {mode === 'freestyle' && freestyleGame.screen === 'playing' && (
        <FreestyleGameScreen game={freestyleGame} />
      )}
      {mode === 'freestyle' && freestyleGame.screen === 'results' && (
        <FreestyleResultsScreen
          results={freestyleGame.results}
          onPlayAgain={() => handleStart('freestyle')}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(247, 243, 232, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.hand,
    fontSize: 22,
    color: theme.ink,
  },
});
