import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { FONT_COLOR, GOLD_COLOR_1, GOLD_COLOR_2 } from '../constants';
import { useFont } from '../hooks/useFont';
import { LinearGradient } from 'expo-linear-gradient';
import { hexToRgbaString } from '../utils/harmonicColors';

interface InputWrapperProps extends TextInputProps {
  fillColor: string;
  style?: object;
}

const InputWrapper = React.forwardRef<TextInput, InputWrapperProps>(({ ...props }, ref) => {
  const fontFamily = useFont();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[GOLD_COLOR_1, GOLD_COLOR_2, GOLD_COLOR_1]}
        locations={[0, 0.47, 1]}
        style={styles.gradient}
      />
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
    color: FONT_COLOR,
    fontSize: 20,
  },
  gradient: { width: '100%', height: '100%', position: 'absolute' },
  inputWrapper: {
    backgroundColor: hexToRgbaString('#FFFFFF', 0.45),
    marginHorizontal: 1,
    marginVertical: 1,
  },
});

InputWrapper.displayName = 'InputWrapper';

export default InputWrapper;
