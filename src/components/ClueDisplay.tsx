import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { theme } from '../theme';
import { HandText } from './HandLetter';

type Props = {
  clue: string;
  wordNumber: number;
  totalWords: number;
  compact?: boolean;
  bottom?: boolean;
  beside?: boolean;
};

export function ClueDisplay({
  clue,
  wordNumber,
  totalWords,
  compact = false,
  bottom = false,
  beside = false,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const maxTextWidth = beside
    ? Math.max(120, screenWidth * 0.42)
    : Math.max(160, screenWidth - 96);
  const counterSize = bottom ? 15 : compact ? 14 : 18;
  const clueSize = bottom ? (beside ? 18 : 20) : compact ? 18 : 26;
  const textAlign = beside ? 'left' : bottom ? 'center' : 'right';

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        bottom && styles.containerBottom,
        beside && styles.containerBeside,
      ]}
    >
      <HandText
        fontSize={counterSize}
        color={theme.inkLight}
        textAlign={textAlign}
        maxWidth={maxTextWidth}
      >
        {`${wordNumber} / ${totalWords}`}
      </HandText>
      <View style={[styles.clueWrap, bottom && styles.clueWrapBottom, beside && styles.clueWrapBeside]}>
        <HandText fontSize={clueSize} textAlign={textAlign} maxWidth={maxTextWidth}>
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
    flex: 0,
  },
  containerBeside: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    width: '100%',
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
  clueWrapBeside: {
    alignItems: 'flex-start',
  },
});
