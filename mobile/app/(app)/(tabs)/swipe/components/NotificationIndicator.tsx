import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Flag3Icon } from '../../../utils/icons';
import { convertFigmaShadowToReactNative } from '../../../utils/reusableStuff';
import { GOLD_COLOR_1 } from '../../../constants';

const ICON_SIZE = 24;

export type Mode = 'tabbar' | 'chat-list';

type NotificationIndicatorProps = {
  iconSize: number;
  mode: Mode;
};

export const NotificationIndicator = ({ iconSize, mode }: NotificationIndicatorProps) => {
  const notificationIndicatorSize = iconSize / 3;
  const rotate = mode === 'tabbar' ? 0 : Math.floor(Math.random() * 6) + 6;
  const rotateSign = Math.random() > 0.5 ? '' : '-';
  return (
    <View
      style={[
        styles.container,
        {
          top: mode === 'tabbar' ? 10 : -5,
          left: mode === 'tabbar' ? -notificationIndicatorSize / 4 : 0,
          borderRadius: notificationIndicatorSize,
          width: notificationIndicatorSize,
          height: notificationIndicatorSize,
          transform: [{ rotate: `${rotateSign}${rotate}deg` }],
          ...convertFigmaShadowToReactNative({
            x: 0,
            y: 0,
            blur: 12,
            color: GOLD_COLOR_1,
            opacity: 0.5,
          }),
        },
      ]}
    >
      <Flag3Icon width={ICON_SIZE} height={ICON_SIZE} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
