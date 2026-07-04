import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FreestyleResult } from '../game/types';
import {
  FISH_DIMENSIONS,
  fishDimensionsForWeight,
  formatWeightLbs,
  totalWeightLbs,
} from '../game/scoring';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { theme, fonts } from '../theme';
import { Fish } from './Fish';
import { PaperBackground } from './PaperBackground';
import { SketchButton } from './SketchButton';

const FISH_COLUMN_WIDTH =
  Math.max(...Object.values(FISH_DIMENSIONS).map((d) => d.width)) + 8;
const WORD_MARK_SLOT_WIDTH = 22;
const WORD_MARK_GAP = 6;

type Props = {
  results: FreestyleResult[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
};

export function FreestyleResultsScreen({ results, onPlayAgain, onBackToMenu }: Props) {
  const { isLandscape, isCompact } = useCompactLayout();
  const caught = results.filter((r) => r.guessed).length;
  const totalLbs = totalWeightLbs(results);

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, isCompact && styles.titleCompact]}>Your catch</Text>
      <Text style={[styles.summary, isCompact && styles.summaryCompact]}>
        {caught} of {results.length} words
        {totalLbs > 0 ? ` · ${formatWeightLbs(totalLbs)}` : ''}
      </Text>
    </View>
  );

  const list = (
    <View style={[styles.list, isLandscape && styles.listLandscape]}>
      {results.map((result, i) => {
        const fishDims = fishDimensionsForWeight(result.weightLbs, result.guessed);
        return (
          <View key={i} style={styles.row}>
            <View style={styles.fishSlot}>
              <Fish
                width={fishDims.width}
                height={fishDims.height}
                filled={result.guessed}
              />
            </View>
            <View style={styles.info}>
              <View style={styles.wordRow}>
                <View style={styles.wordMarkSlot}>
                  {!result.guessed && (
                    <Text style={[styles.wordMark, isCompact && styles.wordMarkCompact]}>—</Text>
                  )}
                </View>
                <Text style={[styles.word, isCompact && styles.wordCompact]}>
                  {result.word}
                </Text>
                {result.guessed && (
                  <Text style={[styles.weight, isCompact && styles.weightCompact]}>
                    {formatWeightLbs(result.weightLbs)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  if (isLandscape) {
    return (
      <PaperBackground>
        <View style={styles.landscapeScreen}>
          {header}
          <View style={styles.landscapeBody}>
            <ScrollView
              style={styles.landscapeScroll}
              contentContainerStyle={styles.landscapeScrollContent}
              bounces={false}
            >
              {list}
            </ScrollView>
            <View style={styles.landscapeButton}>
              <SketchButton label="Fish again" onPress={onPlayAgain} compact />
              <SketchButton label="Back to Main Menu" onPress={onBackToMenu} compact />
            </View>
          </View>
        </View>
      </PaperBackground>
    );
  }

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
        bounces={false}
      >
        {header}
        {list}
        <View style={styles.buttons}>
          <SketchButton label="Fish again" onPress={onPlayAgain} />
          <SketchButton label="Back to Main Menu" onPress={onBackToMenu} />
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  contentCompact: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  landscapeScreen: {
    flex: 1,
    minHeight: 0,
    paddingTop: 16,
  },
  landscapeBody: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  landscapeScroll: {
    flex: 1,
    minHeight: 0,
  },
  landscapeScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  landscapeButton: {
    justifyContent: 'center',
    paddingRight: 36,
    paddingLeft: 8,
    flexShrink: 0,
    gap: 12,
  },
  title: {
    fontFamily: fonts.hand,
    fontSize: 48,
    color: theme.ink,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 36,
  },
  summary: {
    fontFamily: fonts.hand,
    fontSize: 24,
    color: theme.inkLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCompact: {
    fontSize: 20,
    marginBottom: 16,
  },
  list: {
    flexGrow: 1,
    gap: 16,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  listLandscape: {
    marginBottom: 0,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fishSlot: {
    width: FISH_COLUMN_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordMarkSlot: {
    width: WORD_MARK_SLOT_WIDTH,
    alignItems: 'flex-end',
    paddingRight: WORD_MARK_GAP,
    flexShrink: 0,
  },
  wordMark: {
    fontFamily: fonts.hand,
    fontSize: 26,
    color: theme.inkLight,
  },
  wordMarkCompact: {
    fontSize: 22,
  },
  word: {
    fontFamily: fonts.hand,
    fontSize: 26,
    color: theme.ink,
  },
  wordCompact: {
    fontSize: 22,
  },
  weight: {
    fontFamily: fonts.hand,
    fontSize: 20,
    color: theme.inkLight,
    marginLeft: 10,
  },
  weightCompact: {
    fontSize: 17,
  },
  buttons: {
    alignItems: 'center',
    gap: 8,
  },
});
