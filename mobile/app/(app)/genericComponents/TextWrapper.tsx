import * as React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { FONT_COLOR } from '../constants';
import { useFonts } from 'expo-font';

interface TextWrapperProps extends TextProps {}

const TextWrapper = ({ ...props }: TextWrapperProps) => {
  const [loadedFonts] = useFonts({
    RokkittRegular: require('../../../assets/fonts/Rokkitt-Regular.ttf'),
  });

  if (!loadedFonts) {
    return null;
  }

  return <Text {...props} style={[props['style'] ? props['style'] : {}, styles.text]} />;
};

const styles = StyleSheet.create({
  text: {
    color: FONT_COLOR,
    fontFamily: 'RokkittRegular',
  },
});

export default TextWrapper;
