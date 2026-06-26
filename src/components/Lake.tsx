import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { placeLettersInLake } from '../game/letterPlacement';
import { computeLetterMetrics } from '../game/layout';
import { LakeShape } from '../game/lakeShapes';
import { LakeLetter as LakeLetterType } from '../game/types';
import { theme } from '../theme';
import { LakeLetter } from './LakeLetter';

type Props = {
  shape: LakeShape;
  letters: LakeLetterType[];
  onLetterPress: (id: string) => void;
  compact?: boolean;
};

export function Lake({ shape, letters, onLetterPress, compact = false }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const letterKey = letters.map((l) => l.id).join('|');
  const inset = shape.clipInset;
  const { width: vbW, height: vbH } = shape.viewBox;

  const metrics = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) return null;
    return computeLetterMetrics(size.width, size.height, letters.length, inset);
  }, [size.width, size.height, letters.length, inset]);

  const positions = useMemo(
    () => placeLettersInLake(shape, letters.length),
    [shape, letters.length, letterKey],
  );

  const displayLetters = letters.map((letter, i) => ({
    ...letter,
    x: positions[i]?.x ?? letter.x,
    y: positions[i]?.y ?? letter.y,
  }));

  return (
    <View style={[styles.container, compact && styles.containerCompact]} onLayout={onLayout}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${vbW} ${vbH}`}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={shape.path}
          fill={theme.lake}
          stroke={theme.lakeBorder}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.letterOverlay} pointerEvents="box-none">
        {size.width > 0 &&
          metrics &&
          displayLetters.map((letter) => (
            <LakeLetter
              key={letter.id}
              letter={letter}
              viewBox={shape.viewBox}
              containerWidth={size.width}
              containerHeight={size.height}
              letterSize={metrics.size}
              fontSize={metrics.fontSize}
              onPress={onLetterPress}
            />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 260,
    maxHeight: 420,
    marginVertical: 4,
    overflow: 'hidden',
  },
  containerCompact: {
    minHeight: 0,
    maxHeight: undefined,
    marginVertical: 0,
  },
  letterOverlay: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
});
