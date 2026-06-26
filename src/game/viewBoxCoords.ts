export function viewBoxScale(
  viewBoxWidth: number,
  viewBoxHeight: number,
  containerWidth: number,
  containerHeight: number,
) {
  return Math.min(containerWidth / viewBoxWidth, containerHeight / viewBoxHeight);
}

/** Map viewBox coords to container pixels (matches SVG default xMidYMid meet). */
export function mapViewBoxToContainer(
  x: number,
  y: number,
  viewBoxWidth: number,
  viewBoxHeight: number,
  containerWidth: number,
  containerHeight: number,
) {
  const scale = viewBoxScale(viewBoxWidth, viewBoxHeight, containerWidth, containerHeight);
  const offsetX = (containerWidth - viewBoxWidth * scale) / 2;
  const offsetY = (containerHeight - viewBoxHeight * scale) / 2;

  return {
    x: x * scale + offsetX,
    y: y * scale + offsetY,
    scale,
  };
}
