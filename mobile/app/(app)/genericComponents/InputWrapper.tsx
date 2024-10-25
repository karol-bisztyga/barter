import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, TextInput, TextInputProps, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONT_COLOR, FONT_COLOR_DISABLED } from '../constants';
import { useAssets } from 'expo-asset';
import { showError } from '../utils/notifications';

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

interface InputWrapperProps extends TextInputProps {
  fillColor: string;
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  const [dimensions, setDimensions] = useState<DimensionsType | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const [assets, error] = useAssets([require('../../../assets/paper.jpg')]);

  useEffect(() => {
    if (error) {
      showError('Error loading assets', `${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (!dimensions || (!dimensions.height && !dimensions.width) || paths.length) {
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

  if (!assets || !assets.length) {
    return null;
  }
  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        setDimensions({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
      }}
    >
      <ImageBackground
        source={{ uri: assets[0].uri }}
        style={styles.background}
        imageStyle={styles.imageStyle}
      >
        <Svg height="100%" width="100%" style={styles.svgOverlay}>
          {paths.map((path, index) => (
            <Path key={index} d={path} fill={props.fillColor} />
          ))}
        </Svg>
      </ImageBackground>
      {dimensions && (
        <TextInput
          ref={ref}
          {...props}
          style={[props['style'] ? props['style'] : {}, styles.input]}
          placeholderTextColor={FONT_COLOR_DISABLED}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  background: {
    flex: 1,
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
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: 5,
    paddingHorizontal: 15,
    color: FONT_COLOR,
    fontFamily: 'Schoolbell',
    fontSize: 20,
  },
});

InputWrapper.displayName = 'InputWrapper';

export default InputWrapper;
