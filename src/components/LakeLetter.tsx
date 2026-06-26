import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { LakeShape } from '../game/lakeShapes';
import { LakeLetter as LakeLetterType } from '../game/types';
import { mapViewBoxToContainer } from '../game/viewBoxCoords';
import { HandLetter, handLetterLakeSize } from './HandLetter';
import { BobbingView } from './PaperBackground';

type Props = {
  letter: LakeLetterType;
  viewBox: LakeShape['viewBox'];
  containerWidth: number;
  containerHeight: number;
  letterSize: number;
  fontSize: number;
  onPress: (id: string) => void;
};

export function LakeLetter({
  letter,
  viewBox,
  containerWidth,
  containerHeight,
  letterSize,
  fontSize,
  onPress,
}: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const { width, height } = handLetterLakeSize(letterSize, fontSize);

  useEffect(() => {
    if (!letter.sunk) {
      opacity.setValue(1);
      return;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [letter.sunk, opacity]);

  if (letter.used) return null;

  const { x: centerX, y: centerY } = mapViewBoxToContainer(
    letter.x,
    letter.y,
    viewBox.width,
    viewBox.height,
    containerWidth,
    containerHeight,
  );

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          left: centerX - width / 2,
          top: centerY - height / 2,
          width,
          opacity,
        },
      ]}
    >
      <BobbingView offset={letter.bobOffset}>
        <Pressable
          onPress={() => onPress(letter.id)}
          disabled={letter.sunk}
          hitSlop={14}
          style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
        >
          <HandLetter fontSize={fontSize} boxSize={letterSize}>
            {letter.char}
          </HandLetter>
        </Pressable>
      </BobbingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
  },
  hit: {
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});
