import { Platform } from 'react-native';

export type EdgeType = 'top' | 'bottom' | 'left' | 'right';

export const MIN_TRIANGLE_SIZE = 2;

export const getMaxTriangleSize = (width: number, height: number) => {
  return Math.min(width, height) / 10 + MIN_TRIANGLE_SIZE;
};

export type DimensionsType = {
  width: number;
  height: number;
};

export const generateBentTrianglePath = (edge: EdgeType, dimensions: DimensionsType) => {
  const { width, height } = dimensions;

  const maxSize = Math.min(width, height) / 10;
  const baseLength = Math.random() * maxSize + MIN_TRIANGLE_SIZE; // Random base length between 30 and maxSize
  const heightLength = Math.random() * maxSize + MIN_TRIANGLE_SIZE; // Random height length between 30 and maxSize

  // Random bend control points for more pronounced curvature
  const bendFactor = 0.5; // Bend factor to control how curvy the sides are
  const controlPoint1OffsetX = baseLength * bendFactor * (Math.random() - 0.5);
  const controlPoint1OffsetY = heightLength * bendFactor * (Math.random() - 0.5);
  const controlPoint2OffsetX = baseLength * bendFactor * (Math.random() - 0.5);
  const controlPoint2OffsetY = heightLength * bendFactor * (Math.random() - 0.5);

  // Random base position along the specified edge
  let basePosition;
  const offset = getMaxTriangleSize(width, height) * 2;

  switch (edge) {
    case 'top':
      // Base on the top edge, pointing down
      basePosition = Math.random() * (width - offset * 2) + offset;
      return `
        M${basePosition},0
        Q${basePosition + baseLength / 4 + controlPoint1OffsetX},${controlPoint1OffsetY} ${basePosition + baseLength / 2},${heightLength}
        Q${basePosition + (3 * baseLength) / 4 + controlPoint2OffsetX},${controlPoint2OffsetY} ${basePosition + baseLength},0
        Z
      `;
    case 'bottom':
      // Base on the bottom edge, pointing up
      basePosition = Math.random() * (width - offset * 2) + offset;
      return `
        M${basePosition},${height}
        Q${basePosition + baseLength / 4 + controlPoint1OffsetX},${height - controlPoint1OffsetY} ${basePosition + baseLength / 2},${height - heightLength}
        Q${basePosition + (3 * baseLength) / 4 + controlPoint2OffsetX},${height - controlPoint2OffsetY} ${basePosition + baseLength},${height}
        Z
      `;
    case 'left':
      // Base on the left edge, pointing to the right
      basePosition = Math.random() * (height - offset * 2) + offset;
      return `
        M0,${basePosition}
        Q${controlPoint1OffsetX},${basePosition + heightLength / 4 + controlPoint1OffsetY} ${baseLength},${basePosition + heightLength / 2}
        Q${controlPoint2OffsetX},${basePosition + (3 * heightLength) / 4 + controlPoint2OffsetY} 0,${basePosition + heightLength}
        Z
      `;
    case 'right':
      // Base on the right edge, pointing to the left
      basePosition = Math.random() * (height - offset * 2) + offset;
      return `
        M${width},${basePosition}
        Q${width - controlPoint1OffsetX},${basePosition + heightLength / 4 + controlPoint1OffsetY} ${width - baseLength},${basePosition + heightLength / 2}
        Q${width - controlPoint2OffsetX},${basePosition + (3 * heightLength) / 4 + controlPoint2OffsetY} ${width},${basePosition + heightLength}
        Z
      `;
    default:
      throw new Error('Invalid edge specified');
  }
};

export const generatePaths = (dimensions: DimensionsType) => {
  const topBottomTrianglesFactor = Math.floor(dimensions.width / 30);

  const numberOfTopTriangles = Math.floor(Math.random() * topBottomTrianglesFactor) + 2;
  const numberOfBottomTriangles = Math.floor(Math.random() * topBottomTrianglesFactor) + 2;

  const numberOfRightTriangles = Math.floor(Math.random() * 3) + 3;
  const numberOfLeftTriangles = Math.floor(Math.random() * 3) + 3;

  const paths = [];

  for (let i = 0; i < numberOfTopTriangles; i++) {
    paths.push(generateBentTrianglePath('top', dimensions));
  }
  for (let i = 0; i < numberOfRightTriangles; i++) {
    paths.push(generateBentTrianglePath('right', dimensions));
  }
  for (let i = 0; i < numberOfBottomTriangles; i++) {
    paths.push(generateBentTrianglePath('bottom', dimensions));
  }
  for (let i = 0; i < numberOfLeftTriangles; i++) {
    paths.push(generateBentTrianglePath('left', dimensions));
  }

  return paths;
};

export const getDefaultFont = () => {
  if (Platform.OS === 'android') {
    return 'Roboto';
  }
  if (Platform.OS === 'ios') {
    return 'SF Pro';
  }
  return '';
};
