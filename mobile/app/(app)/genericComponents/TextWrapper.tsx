import * as React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { FONT_COLOR } from '../constants';
import { useFont } from '../hooks/useFont';

interface TextWrapperProps extends TextProps {}

const TextWrapper = ({ ...props }: TextWrapperProps) => {
  const fontFamily = useFont();

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
