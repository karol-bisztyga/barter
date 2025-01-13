import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BrownGradient } from './gradients/BrownGradient';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import { GOLD_COLOR_1 } from '../constants';

export const ICON_WRAPPER_SIZE = 47;

type IconButtonWithoutEventsProps = {
  Icon: FC<SvgProps>;
  disabled?: boolean;
  style?: ViewStyle;
  iconRotateDeg?: number;
};

export const IconButtonWithoutEvents = ({
  Icon,
  disabled,
  style,
  iconRotateDeg = 0,
}: IconButtonWithoutEventsProps) => {
  return (
    <View
      style={[
        styles.iconWrapper,
        {
          opacity: disabled ? 0.65 : 1,
        },
        style,
      ]}
    >
      <BrownGradient style={styles.gradient} />
      <Icon
        width={28}
        height={28}
        style={{
          transform: [{ rotate: `${iconRotateDeg}deg` }],
        }}
      />
    </View>
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
