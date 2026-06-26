import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { HandLetter, handLetterPixelSize } from './HandLetter';

type Props = {
  guess: (string | null)[];
  revealed: boolean;
  answer?: string;
  onSlotPress: (index: number) => void;
  compact?: boolean;
  beside?: boolean;
};

export function GuessSlots({
  guess,
  revealed,
  answer,
  onSlotPress,
  compact = false,
  beside = false,
}: Props) {
  const fontSize = compact ? 24 : 32;
  const { height: letterHeight } = handLetterPixelSize(fontSize);

  return (
    <View style={[styles.row, compact && styles.rowCompact, beside && styles.rowBeside]}>
      {guess.map((char, i) => {
        const display = revealed && answer ? answer[i] : char;
        const showChar = display !== null && display !== undefined;

        return (
          <Pressable
            key={i}
            onPress={() => onSlotPress(i)}
            disabled={revealed}
            style={styles.slot}
          >
            <View style={[styles.letterSlot, { minHeight: letterHeight }]}>
              {showChar ? (
                <HandLetter fontSize={fontSize}>{display}</HandLetter>
              ) : (
                <View style={styles.underscore} />
              )}
            </View>
            <View style={styles.underline} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingBottom: 18,
    overflow: 'visible',
  },
  rowCompact: {
    gap: 6,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  rowBeside: {
    gap: 4,
    paddingVertical: 0,
    paddingBottom: 0,
  },
  slot: {
    alignItems: 'center',
    minWidth: 40,
    overflow: 'visible',
  },
  letterSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  underscore: {
    width: 14,
    height: 2,
    backgroundColor: theme.inkLight,
    marginTop: 12,
  },
  underline: {
    width: 30,
    height: 2,
    backgroundColor: theme.ink,
    marginTop: 6,
    borderRadius: 1,
  },
});
