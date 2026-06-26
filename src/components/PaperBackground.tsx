import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { theme } from '../theme';

const LINE_SPACING = 32;
const TOP_MARGIN = 64;
const LEFT_MARGIN = 44;
const HOLE_SIZE = 18;
const HOLE_LEFT = 16;
// US letter 3-hole punch: centers at 4.25", 8.5", 12.75" (4.25" apart)
const PX_PER_INCH = 64;
const HOLE_SPACING = 4.25 * PX_PER_INCH;
const FIRST_HOLE_CENTER = 4.25 * PX_PER_INCH;

function holeTops() {
  return [0, 1, 2].map((i) => FIRST_HOLE_CENTER + i * HOLE_SPACING - HOLE_SIZE / 2);
}

export function PaperBackground({ children }: { children: React.ReactNode }) {
  const { height } = useWindowDimensions();
  const lineCount = Math.ceil((height - TOP_MARGIN) / LINE_SPACING) + 2;

  return (
    <View style={styles.container}>
      <View style={styles.decor} pointerEvents="none">
        {holeTops().map((top, i) => (
          <View
            key={`hole-${i}`}
            style={[
              styles.hole,
              {
                top,
                left: HOLE_LEFT,
              },
            ]}
          />
        ))}
        {Array.from({ length: lineCount }).map((_, i) => (
          <View
            key={`line-${i}`}
            style={[
              styles.line,
              {
                top: TOP_MARGIN + i * LINE_SPACING,
                left: LEFT_MARGIN,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

type BobProps = {
  children: React.ReactNode;
  offset: number;
};

export function BobbingView({ children, offset }: BobProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1400 + offset * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1400 + offset * 100,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, offset]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  content: {
    flex: 1,
    paddingLeft: LEFT_MARGIN,
  },
  decor: {
    ...StyleSheet.absoluteFill,
  },
  line: {
    position: 'absolute',
    right: 0,
    height: 1,
    backgroundColor: theme.line,
    opacity: 0.55,
  },
  hole: {
    position: 'absolute',
    width: HOLE_SIZE,
    height: HOLE_SIZE,
    borderRadius: HOLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: theme.inkLight,
    backgroundColor: '#EDE8DA',
  },
});
