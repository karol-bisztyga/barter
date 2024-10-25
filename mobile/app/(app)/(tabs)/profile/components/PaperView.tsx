import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BORDER_COLOR = '#968b11';

type EdgeType = 'top' | 'bottom' | 'left' | 'right';
type CoordsType = { x: number; y: number };

/*
const generateTrianglePath = (edge: EdgeType, width: number, height: number) => {
  // Random size for the triangle (making sure it's relatively small)
  const maxSize = Math.min(width, height) / 5; // Limit the max size to 1/5th of the view dimensions
  const triangleWidth = Math.random() * maxSize + 10; // Random width between 10 and maxSize
  const triangleHeight = Math.random() * maxSize + 10; // Random height between 10 and maxSize

  // Random bend control points (relative to triangle size, for a subtle bend)
  const bendFactor = 0.3; // Max bend ratio
  const controlPointX = triangleWidth * bendFactor * (Math.random() - 0.5);
  const controlPointY = triangleHeight * bendFactor * (Math.random() - 0.5);

  // Random position for the triangle base
  let basePosition = 0;
  switch (edge) {
    case 'top':
      basePosition = Math.random() * (width - triangleWidth);
      return `
        M${basePosition},0
        C${basePosition + controlPointX},${controlPointY} ${basePosition + triangleWidth - controlPointX},${controlPointY} ${basePosition + triangleWidth},0
        L${basePosition + triangleWidth},${triangleHeight}
        L${basePosition},${triangleHeight}
        Z
      `;
    case 'bottom':
      basePosition = Math.random() * (width - triangleWidth);
      return `
        M${basePosition},${height}
        C${basePosition + controlPointX},${height - controlPointY} ${basePosition + triangleWidth - controlPointX},${height - controlPointY} ${basePosition + triangleWidth},${height}
        L${basePosition + triangleWidth},${height - triangleHeight}
        L${basePosition},${height - triangleHeight}
        Z
      `;
    case 'left':
      basePosition = Math.random() * (height - triangleHeight);
      return `
        M0,${basePosition}
        C${controlPointX},${basePosition + controlPointY} ${controlPointX},${basePosition + triangleHeight - controlPointY} 0,${basePosition + triangleHeight}
        L${triangleWidth},${basePosition + triangleHeight}
        L${triangleWidth},${basePosition}
        Z
      `;
    case 'right':
      basePosition = Math.random() * (height - triangleHeight);
      return `
        M${width},${basePosition}
        C${width - controlPointX},${basePosition + controlPointY} ${width - controlPointX},${basePosition + triangleHeight - controlPointY} ${width},${basePosition + triangleHeight}
        L${width - triangleWidth},${basePosition + triangleHeight}
        L${width - triangleWidth},${basePosition}
        Z
      `;
    default:
      throw new Error('Invalid edge specified');
  }
};

const generateBentTrianglePath = (edge, width, height) => {
  // Random size for the triangle (keeping it relatively small)
  const maxSize = Math.min(width, height) / 5; // Limit to 1/5th of view dimensions
  const baseLength = Math.random() * maxSize + 20; // Random base length between 20 and maxSize
  const heightLength = Math.random() * maxSize + 20; // Random height length between 20 and maxSize

  // Random bend factors for curve control points
  const bendFactorX = baseLength * 0.4 * (Math.random() - 0.5); // Control point horizontal offset
  const bendFactorY = heightLength * 0.4 * (Math.random() - 0.5); // Control point vertical offset

  // Random base position along the specified edge
  let basePosition;

  switch (edge) {
    case 'top':
      // Base on the top edge, pointing down
      basePosition = Math.random() * (width - baseLength);
      return `
        M${basePosition},0
        C${basePosition + bendFactorX},${bendFactorY} ${basePosition + baseLength - bendFactorX},${bendFactorY} ${basePosition + baseLength},0
        L${basePosition + baseLength / 2},${heightLength}
        Z
      `;
    case 'bottom':
      // Base on the bottom edge, pointing up
      basePosition = Math.random() * (width - baseLength);
      return `
        M${basePosition},${height}
        C${basePosition + bendFactorX},${height - bendFactorY} ${basePosition + baseLength - bendFactorX},${height - bendFactorY} ${basePosition + baseLength},${height}
        L${basePosition + baseLength / 2},${height - heightLength}
        Z
      `;
    case 'left':
      // Base on the left edge, pointing to the right
      basePosition = Math.random() * (height - heightLength);
      return `
        M0,${basePosition}
        C${bendFactorX},${basePosition + bendFactorY} ${bendFactorX},${basePosition + heightLength - bendFactorY} 0,${basePosition + heightLength}
        L${baseLength},${basePosition + heightLength / 2}
        Z
      `;
    case 'right':
      // Base on the right edge, pointing to the left
      basePosition = Math.random() * (height - heightLength);
      return `
        M${width},${basePosition}
        C${width - bendFactorX},${basePosition + bendFactorY} ${width - bendFactorX},${basePosition + heightLength - bendFactorY} ${width},${basePosition + heightLength}
        L${width - baseLength},${basePosition + heightLength / 2}
        Z
      `;
    default:
      throw new Error('Invalid edge specified');
  }
};
*/

const MIN_TRIANGLE_SIZE = 4;

const getMaxTriangleSize = (width: number, height: number) => {
  return Math.min(width, height) / 10 + MIN_TRIANGLE_SIZE;
};

const generateBentTrianglePath = (edge: EdgeType, width: number, height: number) => {
  // Random size for the triangle (keeping it relatively small)
  const maxSize = Math.min(width, height) / 10; // Limit to 1/5th of view dimensions
  // console.log('max size', maxSize);
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
      // console.log('generating top triangle', width, baseLength);
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

/**
 *
 * @param edge
 * @param viewSize - for edge top/bottom should be width, for edge left/right should be height
 * @param offset - we do not wnat to overlap with the triangle on the next edge,
 *    so for top/bottom edge this should be max height of the triangles for left/right edge,
 *    and for left/right edge this should be max width of the triangles for top/bottom edge
 * @returns
 */
const generateNonCollidingPositions = (
  edge: EdgeType,
  viewWidth: number,
  viewHeight: number,
  numPositions: number
  // offsetX: number,
  // offsetY: number
) => {
  const positions: CoordsType[] = [];

  const offset = getMaxTriangleSize(viewWidth, viewHeight);
  const minDistance = offset;

  const maxRetries = 10;

  const generateRandomX = () => Math.random() * (viewWidth - offset * 2) + offset;
  const generateRandomY = () => Math.random() * (viewHeight - offset * 2) + offset;

  const checkCollisionsX = (x: number) => {
    return positions.every((pos) => Math.abs(pos.x - x) > minDistance);
  };

  const checkCollisionsY = (y: number) => {
    return positions.every((pos) => Math.abs(pos.y - y) > minDistance);
  };

  for (let i = 0; i < numPositions; i++) {
    let x: number | null = null;
    let y: number | null = null;
    let retryCounter = 0;
    if (edge === 'top' || edge === 'bottom') {
      while (x === null || (!checkCollisionsX(x) && retryCounter++ < maxRetries)) {
        x = generateRandomX();
      }
      if (!checkCollisionsX(x)) {
        continue;
      }
      y = edge === 'top' ? 0 : viewHeight;
    }
    if (edge === 'left' || edge === 'right') {
      while (y === null || (!checkCollisionsY(y) && retryCounter++ < maxRetries)) {
        y = generateRandomY();
      }
      if (!checkCollisionsY(y)) {
        continue;
      }
      x = edge === 'left' ? 0 : viewWidth;
    }
    // switch (edge) {
    //   case 'bottom':
    //     x = Math.random() * (viewWidth - offset * 2) + offset;
    //     y = viewHeight;
    //     break;
    //   case 'top':
    //     x = Math.random() * (viewWidth - offset * 2) + offset;
    //     y = 0;
    //     break;
    //   case 'left':
    //     x = 0;
    //     y = Math.random() * (viewHeight - offset * 2) + offset;
    //     break;
    //   case 'right':
    //     x = viewWidth;
    //     y = Math.random() * (viewHeight - offset * 2) + offset;
    //     break;
    //   default:
    //     throw new Error('Invalid edge specified');
    // }
    // console.log('here', x, y);
    if (x !== null && y !== null) {
      positions.push({ x, y });
    }
  }
  // console.log('ret', positions);
  return positions;
};

type DimensionsType = {
  width: number;
  height: number;
};

const PaperView = () => {
  const [dimensions, setDimensions] = useState<DimensionsType | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  // const topTrianglePath = generateTrianglePath('top', width, height);
  // const rightTrianglePath = generateTrianglePath('right', width, height);
  // const bottomTrianglePath = generateTrianglePath('bottom', width, height);
  // const leftTrianglePath = generateTrianglePath('left', width, height);

  console.log('PATHs', paths.length);

  useEffect(() => {
    if (!dimensions || paths.length) {
      return;
    }
    const { width, height } = dimensions;
    // const topTrianglePath = generateBentTrianglePath('top', width, height);
    // const rightTrianglePath = generateBentTrianglePath('right', width, height);
    // const bottomTrianglePath = generateBentTrianglePath('bottom', width, height);
    // const leftTrianglePath = generateBentTrianglePath('left', width, height);

    // setPaths([topTrianglePath, rightTrianglePath, bottomTrianglePath, leftTrianglePath]);

    // const topPositions = generateNonCollidingPositions('top', width, height, 10);

    const numberOfTopTriangles = Math.floor(Math.random() * 20) + 5;
    const numberOfBottomTriangles = Math.floor(Math.random() * 20) + 5;

    const numberOfRightTriangles = Math.floor(Math.random() * 3) + 3;
    const numberOfLeftTriangles = Math.floor(Math.random() * 3) + 3;

    console.log('number of triangles', numberOfTopTriangles, numberOfRightTriangles);

    for (let i = 0; i < numberOfTopTriangles; i++) {
      setPaths((prevPaths) => [...prevPaths, generateBentTrianglePath('top', width, height)]);
    }
    for (let i = 0; i < numberOfRightTriangles; i++) {
      setPaths((prevPaths) => [...prevPaths, generateBentTrianglePath('right', width, height)]);
    }
    for (let i = 0; i < numberOfBottomTriangles; i++) {
      setPaths((prevPaths) => [...prevPaths, generateBentTrianglePath('bottom', width, height)]);
    }
    for (let i = 0; i < numberOfLeftTriangles; i++) {
      setPaths((prevPaths) => [...prevPaths, generateBentTrianglePath('left', width, height)]);
    }
  }, [dimensions]);

  const [x, setX] = useState(0);

  return (
    <TouchableOpacity
      style={styles.container}
      onLayout={(e) => {
        setDimensions({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
      }}
      onPress={() => {
        setX(x + 1);
      }}
    >
      <ImageBackground
        source={require('../../../../../assets/paper.jpg')}
        style={styles.background}
        imageStyle={styles.imageStyle}
      >
        <Svg height="100%" width="100%" style={styles.svgOverlay}>
          {/* Draw triangles with paths */}
          {paths.map((path, index) => (
            // <Path key={index} d={path} fill="white" />
            <Path
              key={index}
              d={path}
              fill="white"
              // shadowColor="#000"
              // stroke={BORDER_COLOR}
              // strokeWidth={1}
              // shadowColor="#000"
              // shadowOpacity={0.5}
              // shadowRadius={3}
              // shadowOffset={{ width: 2, height: 2 }}
            />
          ))}
          {/* <Path d={topTrianglePath} fill="white" />
          <Path d={rightTrianglePath} fill="white" />
          <Path d={bottomTrianglePath} fill="white" />
          <Path d={leftTrianglePath} fill="white" /> */}
        </Svg>
      </ImageBackground>
      {dimensions && (
        <Text
          style={{
            position: 'absolute',
            top: dimensions.height / 2 - 10,
            height: 20,
            width: 20,
            textAlign: 'center',
            lineHeight: 20,
            left: dimensions.width / 2 - 10,
          }}
        >
          {x}
        </Text>
      )}
    </TouchableOpacity>
  );

  // return (
  //   <View style={styles.container}>
  //     {/* Old paper background using an image */}
  //     <ImageBackground
  //       source={require('../../../../../assets/paper.jpg')}
  //       style={styles.background}
  //       imageStyle={styles.imageStyle}
  //     >
  //       {/* SVG overlay with bent triangle cut-outs and shadows */}
  //       <Svg height="100%" width="100%" style={styles.svgOverlay}>
  //         {/* Simulated shadows for bent triangles */}
  //         {/* Top-left corner */}
  //         {/* <Path d="M0,0 C15,5 5,15 0,20 L5,25 C25,5 5,0 0,0 Z" fill="rgba(0, 0, 0, 0.3)" /> */}
  //         {/* Bottom-left corner */}
  //         <Path d="M0,80 C5,75 15,95 0,100 L5,105 C25,85 0,80 0,80 Z" fill="rgba(0, 0, 0, 0.3)" />
  //         {/* Top-right corner */}
  //         {/* <Path d="M100,0 C85,5 95,15 100,20 L95,25 C75,5 95,0 100,0 Z" fill="rgba(0, 0, 0, 0.3)" /> */}
  //         {/* Bottom-right corner */}
  //         <Path
  //           d="M100,80 C95,75 85,95 100,100 L95,105 C75,85 100,80 100,80 Z"
  //           fill="rgba(0, 0, 0, 0.3)"
  //         />

  //         {/* Actual bent triangle cut-outs */}
  //         {/* Top-left corner */}
  //         {/* <Path d="M0,0 C10,5 5,10 0,20 L5,25 C20,10 5,0 0,0 Z" fill="white" /> */}
  //         {/* Bottom-left corner */}
  //         <Path d="M0,80 C5,75 10,95 0,100 L5,105 C20,90 0,80 0,80 Z" fill="white" />
  //         {/* Top-right corner */}
  //         {/* <Path d="M100,0 C90,5 95,10 100,20 L95,25 C80,10 95,0 100,0 Z" fill="white" /> */}
  //         {/* Bottom-right corner */}
  //         <Path d="M100,80 C95,75 90,95 100,100 L95,105 C80,90 100,80 100,80 Z" fill="white" />
  //       </Svg>
  //     </ImageBackground>
  //   </View>
  // );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 100,
    margin: 50,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    resizeMode: 'cover', // Adjusts the paper texture to cover the entire area
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default PaperView;
