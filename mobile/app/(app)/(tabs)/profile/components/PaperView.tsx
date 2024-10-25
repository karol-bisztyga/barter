import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type EdgeType = 'top' | 'bottom' | 'left' | 'right';

const MIN_TRIANGLE_SIZE = 4;

const getMaxTriangleSize = (width: number, height: number) => {
  return Math.min(width, height) / 10 + MIN_TRIANGLE_SIZE;
};

const generateBentTrianglePath = (edge: EdgeType, width: number, height: number) => {
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

type DimensionsType = {
  width: number;
  height: number;
};

const PaperView = () => {
  const [dimensions, setDimensions] = useState<DimensionsType | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    if (!dimensions || paths.length) {
      return;
    }
    const { width, height } = dimensions;

    const numberOfTopTriangles = Math.floor(Math.random() * 20) + 5;
    const numberOfBottomTriangles = Math.floor(Math.random() * 20) + 5;

    const numberOfRightTriangles = Math.floor(Math.random() * 3) + 3;
    const numberOfLeftTriangles = Math.floor(Math.random() * 3) + 3;

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
          {paths.map((path, index) => (
            <Path key={index} d={path} fill="white" />
          ))}
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
    resizeMode: 'repeat',
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
