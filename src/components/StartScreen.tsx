import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '../theme';
import { Fish } from './Fish';
import { PaperBackground } from './PaperBackground';
import { SketchButton } from './SketchButton';
import { useCompactLayout } from '../hooks/useCompactLayout';

type Props = {
  onStart: () => void;
};

export function StartScreen({ onStart }: Props) {
  const { isCompact } = useCompactLayout();

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
        bounces={false}
      >
        <Text style={[styles.title, isCompact && styles.titleCompact]}>Fsh</Text>
        <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>
          Guess the word from the clue.{'\n'}
          Letters float in the lake — wrong ones sink.{'\n'}
          Catch it fast for a bigger fish!
        </Text>
        <View style={styles.fishRow}>
          <Fish size="tiny" />
          <Fish size="small" />
          <Fish size="medium" />
          <Fish size="large" />
          <Fish size="whale" />
        </View>
        <SketchButton label="Cast your line" onPress={onStart} />
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 32,
  },
  contentCompact: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.hand,
    fontSize: 72,
    color: theme.ink,
    marginBottom: 16,
  },
  titleCompact: {
    fontSize: 48,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.hand,
    fontSize: 22,
    color: theme.inkLight,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 32,
  },
  subtitleCompact: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 16,
  },
  fishRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 8,
  },
});
