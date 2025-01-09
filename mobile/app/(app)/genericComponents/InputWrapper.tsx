import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { BLACK_COLOR } from '../constants';
import { useFont } from '../hooks/useFont';
import { hexToRgbaString } from '../utils/harmonicColors';
import { GoldGradient } from './gradients/GoldGradient';

interface InputWrapperProps extends TextInputProps {
  fillColor: string;
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  const fontFamily = useFont();

  return (
    <View style={styles.container}>
      <GoldGradient style={{ opacity: 0.25 }} />
      <View style={styles.inputWrapper}>
        <TextInput
          ref={ref}
          {...props}
          style={[
            styles.input,
            { fontFamily: fontFamily.regular },
            props['style'] ? props['style'] : {},
          ]}
          placeholderTextColor={hexToRgbaString(BLACK_COLOR, 0.6)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: BLACK_COLOR,
    fontSize: 20,
  },
  inputWrapper: {
    backgroundColor: hexToRgbaString('#FFFFFF', 0.45),
    marginHorizontal: 1,
    marginVertical: 1,
    overflow: 'hidden',
  },
});

InputWrapper.displayName = 'InputWrapper';

export default InputWrapper;
