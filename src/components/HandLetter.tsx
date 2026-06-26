import Svg, { Text as SvgText } from 'react-native-svg';
import { fonts, theme } from '../theme';

type Props = {
  children: string;
  fontSize: number;
  color?: string;
  /** Tight box for lake letters; omit for generous answer-slot sizing. */
  boxSize?: number;
};

type HandTextProps = {
  children: string;
  fontSize: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
};

/** Generous canvas for answer slots — avoids iOS clipping. */
export function handLetterPixelSize(fontSize: number) {
  return {
    width: Math.ceil(fontSize * 1.5),
    height: Math.ceil(fontSize * 1.75),
  };
}

/** Caveat runs wide — estimate ink width for phrase layout. */
export function handTextPixelSize(text: string, fontSize: number, maxWidth?: number) {
  const charWidth = fontSize * 0.52;
  const width = Math.ceil(text.length * charWidth + fontSize * 0.35);
  const height = Math.ceil(fontSize * 1.75);
  if (maxWidth && width > maxWidth) {
    return { width: maxWidth, height: Math.ceil(fontSize * 3.2) };
  }
  return { width, height };
}

/** Lake letters use the placement footprint so glyphs stay inside the lake. */
export function handLetterLakeSize(letterSize: number, fontSize: number) {
  return {
    width: letterSize,
    height: Math.ceil(letterSize * 1.05),
    fontSize,
  };
}

export function HandText({
  children,
  fontSize,
  color = theme.ink,
  textAlign = 'center',
  maxWidth,
}: HandTextProps) {
  const { width, height } = handTextPixelSize(children, fontSize, maxWidth);
  const anchor =
    textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';
  const x =
    textAlign === 'center' ? width / 2 : textAlign === 'right' ? width - 6 : 6;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <SvgText
        x={x}
        y={height * 0.62}
        fontSize={fontSize}
        fontFamily={fonts.hand}
        fill={color}
        textAnchor={anchor}
      >
        {children}
      </SvgText>
    </Svg>
  );
}

export function HandLetter({ children, fontSize, color = theme.ink, boxSize }: Props) {
  const { width, height } = boxSize
    ? handLetterLakeSize(boxSize, fontSize)
    : handLetterPixelSize(fontSize);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <SvgText
        x={width / 2}
        y={height / 2}
        fontSize={fontSize}
        fontFamily={fonts.hand}
        fill={color}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {children}
      </SvgText>
    </Svg>
  );
}
