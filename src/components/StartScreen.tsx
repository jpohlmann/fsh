import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameMode } from '../game/types';
import { theme, fonts } from '../theme';
import { Fish } from './Fish';
import { PaperBackground } from './PaperBackground';
import { SketchButton } from './SketchButton';
import { useCompactLayout } from '../hooks/useCompactLayout';

type Props = {
  onStart: (mode: GameMode) => void;
  dailyDateLabel?: string;
  dailyLoading?: boolean;
  dailyError?: string | null;
  onDismissError?: () => void;
};

export function StartScreen({
  onStart,
  dailyDateLabel,
  dailyLoading,
  dailyError,
  onDismissError,
}: Props) {
  const { isCompact } = useCompactLayout();

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
        bounces={false}
      >
        <Text style={[styles.title, isCompact && styles.titleCompact]}>Fsh</Text>

        <View style={[styles.modesRow, isCompact && styles.modesRowCompact]}>
          <View style={[styles.modeBlock, isCompact && styles.modeBlockCompact]}>
            <Text style={[styles.modeTitle, isCompact && styles.modeTitleCompact]}>
              Guess the word
            </Text>
            {dailyDateLabel ? (
              <Text style={[styles.dailyLabel, isCompact && styles.dailyLabelCompact]}>
                {dailyDateLabel}
              </Text>
            ) : null}
            <Text style={[styles.modeDesc, isCompact && styles.modeDescCompact]}>
              Clues float beside the lake. Wrong letters sink.{'\n'}
              Catch it fast for a bigger fish!
            </Text>
            <View style={styles.fishRow}>
              <Fish size="tiny" />
              <Fish size="small" />
              <Fish size="medium" />
              <Fish size="large" />
              <Fish size="whale" />
            </View>
            <SketchButton
              label="Cast your line"
              onPress={() => onStart('clue')}
              disabled={dailyLoading}
            />
            {dailyError ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, isCompact && styles.errorTextCompact]}>
                  {dailyError}
                </Text>
                {onDismissError ? (
                  <SketchButton label="OK" onPress={onDismissError} />
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={[styles.divider, isCompact && styles.dividerCompact]} />

          <View style={[styles.modeBlock, isCompact && styles.modeBlockCompact]}>
            <Text style={[styles.modeTitle, isCompact && styles.modeTitleCompact]}>
              Make a word
            </Text>
            <Text style={[styles.modeDesc, isCompact && styles.modeDescCompact]}>
              Ten letters bob in the lake — spell any word you can.{'\n'}
              Longer words weigh more. Letters keep sinking!
            </Text>
            <SketchButton label="Go fishing" onPress={() => onStart('freestyle')} />
          </View>
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  contentCompact: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: fonts.hand,
    fontSize: 72,
    color: theme.ink,
    marginBottom: 32,
  },
  titleCompact: {
    fontSize: 48,
    marginBottom: 20,
  },
  modesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
    maxWidth: 820,
  },
  modesRowCompact: {
    gap: 16,
  },
  modeBlock: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 380,
  },
  modeBlockCompact: {
    maxWidth: undefined,
  },
  modeTitle: {
    fontFamily: fonts.hand,
    fontSize: 32,
    color: theme.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  modeTitleCompact: {
    fontSize: 22,
  },
  dailyLabel: {
    fontFamily: fonts.hand,
    fontSize: 22,
    color: theme.inkLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  dailyLabelCompact: {
    fontSize: 16,
  },
  modeDesc: {
    fontFamily: fonts.hand,
    fontSize: 20,
    color: theme.inkLight,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
    flexGrow: 1,
  },
  modeDescCompact: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  fishRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 4,
  },
  divider: {
    width: 2,
    backgroundColor: theme.line,
    marginVertical: 8,
    borderRadius: 1,
    alignSelf: 'stretch',
  },
  dividerCompact: {
    marginVertical: 4,
  },
  errorBox: {
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  errorText: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: theme.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorTextCompact: {
    fontSize: 15,
    lineHeight: 20,
  },
});
