import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSettingsContext } from '../context/SettingsContext';
import { BrownGradient } from './gradients/BrownGradient';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import { GOLD_COLOR_1, PRESSABLE_ACTIVE_OPACITY } from '../constants';

export const ICON_WRAPPER_SIZE = 47;

type IconButtonProps = {
  Icon: FC<SvgProps>;
  onPress?: () => void;
  beforeCallback?: () => Promise<boolean>;
  disabled?: boolean;
  style?: ViewStyle;
  iconRotateDeg?: number;
};

export const IconButton = ({
  Icon,
  onPress,
  beforeCallback,
  disabled,
  style,
  iconRotateDeg = 0,
}: IconButtonProps) => {
  const settingsContext = useSettingsContext();

  return (
    <TouchableOpacity
      onPress={async () => {
        if (beforeCallback && !(await beforeCallback())) {
          return;
        }
        if (disabled || !onPress) {
          return;
        }
        settingsContext.playSound('click');
        onPress && onPress();
      }}
      disabled={disabled}
      style={[
        styles.iconWrapper,
        {
          opacity: disabled ? 0.65 : 1,
        },
        style,
      ]}
      activeOpacity={PRESSABLE_ACTIVE_OPACITY}
    >
      <BrownGradient style={styles.gradient} />
      <Icon
        width={28}
        height={28}
        style={{
          transform: [{ rotate: `${iconRotateDeg}deg` }],
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: ICON_WRAPPER_SIZE,
    height: ICON_WRAPPER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GOLD_COLOR_1,
    borderRadius: ICON_WRAPPER_SIZE,
  },
  gradient: {
    borderRadius: ICON_WRAPPER_SIZE,
  },
});
