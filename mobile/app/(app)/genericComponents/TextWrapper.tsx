import * as React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { FONT_COLOR } from '../constants';
import { useFonts } from 'expo-font';
import { getDefaultFont } from './utils';

interface TextWrapperProps extends TextProps {}

const TextWrapper = ({ ...props }: TextWrapperProps) => {
  const [loadedFonts] = useFonts({
    Schoolbell: require('../../../assets/fonts/Schoolbell.ttf'),
  });

  const fontFamily = loadedFonts ? 'Schoolbell' : getDefaultFont();

  return (
    <Text
      {...props}
      style={[styles.overridable, props['style'] ? props['style'] : {}, { fontFamily }]}
    />
  );
};

const styles = StyleSheet.create({
  overridable: {
    fontSize: 14,
    color: FONT_COLOR,
  },
});

export default TextWrapper;
