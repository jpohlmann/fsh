import { LakeShape } from './lakeShapes';

type Point = { x: number; y: number };

/** Return the first `count` pre-authored slots for this lake shape. */
export function placeLettersInLake(shape: LakeShape, count: number): Point[] {
  if (count <= 0) return [];
  const limit = Math.min(count, shape.slots.length);
  return shape.slots.slice(0, limit).map((slot) => ({ x: slot.x, y: slot.y }));
}
