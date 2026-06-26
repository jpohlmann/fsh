import { useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { StatusBar } from 'expo-status-bar';
import { GameScreen } from './src/components/GameScreen';
import { ResultsScreen } from './src/components/ResultsScreen';
import { StartScreen } from './src/components/StartScreen';
import { useGame } from './src/game/useGame';
import { theme } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({ Caveat_700Bold });
  const game = useGame();

  const handleStart = useCallback(() => {
    game.startRound();
  }, [game]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.ink} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {game.screen === 'start' && <StartScreen onStart={handleStart} />}
      {game.screen === 'playing' && <GameScreen game={game} />}
      {game.screen === 'results' && (
        <ResultsScreen results={game.results} onPlayAgain={handleStart} />
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
});
