import { LakeShape } from './lakeShapes';
import { viewBoxScale } from './viewBoxCoords';

export type LetterMetrics = {
  size: number;
  fontSize: number;
  minSpacing: number;
};

const MIN_LETTER_SIZE = 24;
const MAX_LETTER_SIZE = 56;
const SIZE_TO_CELL_RATIO = 0.48;

export { viewBoxScale };

export function computeLetterMetrics(
  containerWidth: number,
  containerHeight: number,
  letterCount: number,
  inset: LakeShape['clipInset'],
): LetterMetrics {
  const areaW = Math.max(containerWidth * (1 - inset.left - inset.right), 1);
  const areaH = Math.max(containerHeight * (1 - inset.top - inset.bottom), 1);
  const count = Math.max(letterCount, 1);
  const aspect = areaW / areaH;

  const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect * 0.48)));
  const rows = Math.ceil(count / cols);
  const cell = Math.min(areaW / cols, areaH / rows);

  const density =
    count >= 11 ? 0.88 : count >= 9 ? 0.92 : count >= 7 ? 0.96 : 1;

  const size = Math.round(
    Math.min(
      MAX_LETTER_SIZE,
      Math.max(MIN_LETTER_SIZE, cell * SIZE_TO_CELL_RATIO * density),
    ),
  );
  const fontSize = Math.round(size * 0.72);
  const minSpacing = Math.max(cell * 1.55, size * 2.2);

  return { size, fontSize, minSpacing };
}
