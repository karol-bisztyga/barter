import * as React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { FONT_COLOR, FONT_COLOR_DISABLED } from '../constants';

interface InputWrapperProps extends TextInputProps {
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      {...props}
      style={[props['style'] ? props['style'] : {}, styles.input]}
      placeholderTextColor={FONT_COLOR_DISABLED}
    />
  );
});

InputWrapper.displayName = 'InputWrapper';

const styles = StyleSheet.create({
  input: {
    color: FONT_COLOR,
    backgroundColor: '#006676',
    width: '95%',
  },
});

export default InputWrapper;
