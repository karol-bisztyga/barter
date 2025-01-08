import * as React from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { FONT_COLOR } from '../constants';
import { useFont } from '../hooks/useFont';

interface TextWrapperProps extends TextProps {}

const TextWrapper = ({ ...props }: TextWrapperProps) => {
  // Function to extract fontFamily from style
  const extractFontFamily = (style: StyleProp<TextStyle>) => {
    if (Array.isArray(style)) {
      for (const s of style) {
        if (s && typeof s === 'object' && (s as TextStyle).fontFamily) {
          return (s as TextStyle).fontFamily;
        }
      }
    } else if (style && typeof style === 'object' && style.fontFamily) {
      return style.fontFamily;
    }
    return null;
  };

  const defaultFontFamily = useFont();
  let fontFamily = extractFontFamily(props['style']);
  if (!fontFamily) {
    fontFamily = defaultFontFamily;
  }

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
