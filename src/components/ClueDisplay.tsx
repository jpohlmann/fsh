import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { theme } from '../theme';
import { HandText } from './HandLetter';

type Props = {
  clue: string;
  wordNumber: number;
  totalWords: number;
  compact?: boolean;
  bottom?: boolean;
};

export function ClueDisplay({
  clue,
  wordNumber,
  totalWords,
  compact = false,
  bottom = false,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const maxTextWidth = Math.max(160, screenWidth - 96);
  const counterSize = bottom ? 15 : compact ? 14 : 18;
  const clueSize = bottom ? 20 : compact ? 18 : 26;

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        bottom && styles.containerBottom,
      ]}
    >
      <HandText
        fontSize={counterSize}
        color={theme.inkLight}
        textAlign={bottom ? 'center' : 'right'}
        maxWidth={maxTextWidth}
      >
        {`${wordNumber} / ${totalWords}`}
      </HandText>
      <View style={[styles.clueWrap, bottom && styles.clueWrapBottom]}>
        <HandText
          fontSize={clueSize}
          textAlign={bottom ? 'center' : 'right'}
          maxWidth={maxTextWidth}
        >
          {clue}
        </HandText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'flex-end',
    flex: 1,
    overflow: 'visible',
  },
  containerCompact: {
    paddingHorizontal: 8,
    paddingTop: 4,
    flex: 0,
  },
  containerBottom: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 2,
  },
  clueWrap: {
    marginTop: 8,
    overflow: 'visible',
  },
  clueWrapBottom: {
    marginTop: 2,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
});
