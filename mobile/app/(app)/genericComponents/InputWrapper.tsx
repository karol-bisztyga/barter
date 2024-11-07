import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, TextInput, TextInputProps, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FONT_COLOR, FONT_COLOR_DISABLED } from '../constants';
import { useAssets } from 'expo-asset';
import { DimensionsType, generatePaths, getDefaultFont } from './utils';
import { useFonts } from 'expo-font';

interface InputWrapperProps extends TextInputProps {
  fillColor: string;
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  const [dimensions, setDimensions] = useState<DimensionsType | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const [assets] = useAssets([require('../../../assets/backgrounds/paper.jpg')]);

  const [loadedFonts] = useFonts({
    Schoolbell: require('../../../assets/fonts/Schoolbell.ttf'),
  });

  const fontFamily = loadedFonts ? 'Schoolbell' : getDefaultFont();

  useEffect(() => {
    if (!dimensions || (!dimensions.height && !dimensions.width) || paths.length) {
      return;
    }
    setPaths(generatePaths(dimensions));
  }, [dimensions]);

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        setDimensions({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
      }}
    >
      {assets && assets.length && (
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
      )}
      {dimensions && (
        <TextInput
          ref={ref}
          {...props}
          style={[props['style'] ? props['style'] : {}, styles.input, { fontFamily }]}
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
    backgroundColor: '#ce9e68',
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
    fontSize: 20,
  },
});

InputWrapper.displayName = 'InputWrapper';

export default InputWrapper;
