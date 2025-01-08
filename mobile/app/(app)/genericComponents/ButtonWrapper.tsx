import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BLACK_COLOR, RED_COLOR } from '../constants';
import { useSettingsContext } from '../context/SettingsContext';
import { useFont } from '../hooks/useFont';
import TextWrapper from './TextWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { hexToRgbaString } from '../utils/harmonicColors';
import { GoldGradient } from './GoldGradient';

export const BUTTON_HEIGHT = 56;
export const FALLBACK_BACKGROUND_COLOR = '#432c26';

export type ButtonWrapperMode = 'black' | 'red';

type MyButtonProps = {
  title: string;
  onPress: (() => void) | (() => Promise<void>);
  mode: ButtonWrapperMode;
  marginTop?: number;
  disabled?: boolean;
};

const ButtonWrapper = ({ title, onPress, mode, marginTop = 0, disabled }: MyButtonProps) => {
  const settingsContext = useSettingsContext();

  const fontFamily = useFont();

  const getFillColor = () => {
    switch (mode) {
      case 'black':
        return BLACK_COLOR;
      case 'red':
        return RED_COLOR;
    }
  };

  const fillColor = getFillColor();

  return (
    <TouchableOpacity
      style={[styles.container, { marginTop, opacity: disabled ? 0.5 : 1 }]}
      disabled={disabled}
      onPress={() => {
        settingsContext.playSound('click');
        onPress();
      }}
    >
      <View>
        <GoldGradient />
        <View
          style={{
            margin: 1,
          }}
        >
          <LinearGradient
            colors={[fillColor, hexToRgbaString(fillColor, 0.5), fillColor]}
            locations={[0, 0.47, 1]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <View
            style={{
              margin: 4,
            }}
          >
            <GoldGradient />
            <View
              style={{
                margin: 1,
              }}
            >
              <LinearGradient
                colors={[fillColor, hexToRgbaString(fillColor, 0.6), fillColor]}
                locations={[0, 0.47, 1]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <TextWrapper style={[styles.label, { fontFamily }]}>{title}</TextWrapper>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BUTTON_HEIGHT,
    overflow: 'hidden',
  },
  label: {
    marginTop: 12,
    marginBottom: 9,
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
  },
  gradient: { width: '100%', height: '100%', position: 'absolute' },
});

export default ButtonWrapper;
