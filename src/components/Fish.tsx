import Svg, { Ellipse, Path } from 'react-native-svg';
import { FishSize } from '../game/types';
import { FISH_DIMENSIONS } from '../game/scoring';
import { theme } from '../theme';

type Props = {
  size?: FishSize;
  width?: number;
  height?: number;
  filled?: boolean;
};

export function Fish({ size, width, height, filled = true }: Props) {
  const dims =
    width !== undefined && height !== undefined
      ? { width, height }
      : FISH_DIMENSIONS[size ?? 'medium'];
  const opacity = filled ? 1 : 0.35;
  const strokeWidth = filled ? 2 : 1.5;

  return (
    <Svg width={dims.width} height={dims.height} viewBox="0 0 80 40">
      <Ellipse
        cx="38"
        cy="20"
        rx="28"
        ry="14"
        stroke={theme.ink}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
      />
      <Path
        d="M 10 20 L 0 10 L 0 30 Z"
        stroke={theme.ink}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        strokeLinejoin="round"
      />
      <Path
        d="M 55 14 L 61 20 M 61 14 L 55 20"
        stroke={theme.ink}
        strokeWidth={1.5}
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
      />
    </Svg>
  );
}
