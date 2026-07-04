import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { HandLetter, handLetterPixelSize } from './HandLetter';

type Props = {
  guess: string[];
  revealed: boolean;
  onSlotPress: (index: number) => void;
  compact?: boolean;
};

export function WordGuess({ guess, revealed, onSlotPress, compact = false }: Props) {
  const fontSize = compact ? 24 : 32;
  const { height: letterHeight } = handLetterPixelSize(fontSize);

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {guess.length === 0 ? (
        <View style={[styles.emptySlot, { minHeight: letterHeight }]}>
          <View style={styles.underscore} />
        </View>
      ) : (
        guess.map((char, i) => (
          <Pressable
            key={`${i}-${char}`}
            onPress={() => onSlotPress(i)}
            disabled={revealed}
            style={styles.slot}
          >
            <View style={[styles.letterSlot, { minHeight: letterHeight }]}>
              <HandLetter fontSize={fontSize}>{char}</HandLetter>
            </View>
            <View style={styles.underline} />
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
    overflow: 'visible',
  },
  rowCompact: {
    gap: 4,
    paddingVertical: 4,
  },
  slot: {
    alignItems: 'center',
    minWidth: 36,
    overflow: 'visible',
  },
  emptySlot: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  letterSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  underscore: {
    width: 40,
    height: 2,
    backgroundColor: theme.inkLight,
  },
  underline: {
    width: 28,
    height: 2,
    backgroundColor: theme.ink,
    marginTop: 6,
    borderRadius: 1,
  },
});
