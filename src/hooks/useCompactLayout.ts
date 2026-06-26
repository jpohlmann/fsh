import { useWindowDimensions } from 'react-native';

export function useCompactLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isCompact = isLandscape || height < 520;

  return { isLandscape, isCompact, width, height };
}
