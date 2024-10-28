import * as React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { FONT_COLOR } from '../constants';
import { useFonts } from 'expo-font';

interface TextWrapperProps extends TextProps {}

const TextWrapper = ({ ...props }: TextWrapperProps) => {
  const [loadedFonts] = useFonts({
    Schoolbell: require('../../../assets/fonts/Schoolbell.ttf'),
  });

  if (!loadedFonts) {
    return null;
  }

  return (
    <Text
      {...props}
      style={[styles.overridable, props['style'] ? props['style'] : {}, styles.important]}
    />
  );
};

const styles = StyleSheet.create({
  overridable: {
    fontSize: 14,
    color: FONT_COLOR,
  },
  important: {
    fontFamily: 'Schoolbell',
  },
});

export default TextWrapper;
