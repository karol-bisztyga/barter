import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { BLACK_COLOR } from '../constants';
import { useFont } from '../hooks/useFont';
import { hexToRgbaString } from '../utils/harmonicColors';
import { GoldGradient } from './GoldGradient';

interface InputWrapperProps extends TextInputProps {
  fillColor: string;
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  const fontFamily = useFont();

  return (
    <View style={styles.container}>
      <GoldGradient />
      <View style={styles.inputWrapper}>
        <TextInput
          ref={ref}
          {...props}
          style={[props['style'] ? props['style'] : {}, styles.input, { fontFamily }]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
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
  },
});

InputWrapper.displayName = 'InputWrapper';

export default InputWrapper;
