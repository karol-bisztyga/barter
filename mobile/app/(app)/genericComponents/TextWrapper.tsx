import * as React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { FONT_COLOR } from '../constants';

interface TextWrapperProps extends TextProps {}

const TextWrapper = ({ ...props }: TextWrapperProps) => {
  return <Text {...props} style={[props['style'] ? props['style'] : {}, styles.text]} />;
};

const styles = StyleSheet.create({
  text: {
    color: FONT_COLOR,
    backgroundColor: '#006676',
    width: '100%',
  },
});

export default TextWrapper;
