import * as React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface InputWrapperProps extends TextInputProps {
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  return (
    <TextInput ref={ref} {...props} style={[props['style'] ? props['style'] : {}, styles.input]} />
  );
});

InputWrapper.displayName = 'InputWrapper';

const styles = StyleSheet.create({
  input: {
    color: 'red',
    backgroundColor: 'blue',
  },
});

export default InputWrapper;
