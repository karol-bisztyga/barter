import React from 'react';
import { StyleSheet, View } from 'react-native';
import { generateHarmonicColor, TargetColor } from '../../../utils/harmonicColors';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../../../constants';

type NotificationIndicatorProps = {
  iconSize: number;
};

export const NotificationIndicator = ({ iconSize }: NotificationIndicatorProps) => {
  const notificationIndicatorSize = iconSize / 2;
  return (
    <View
      style={[
        styles.container,
        {
          left: -notificationIndicatorSize / 4,
          borderRadius: notificationIndicatorSize,
          width: notificationIndicatorSize,
          height: notificationIndicatorSize,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: notificationIndicatorSize / 2,
            height: notificationIndicatorSize / 2,
            borderRadius: notificationIndicatorSize,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    backgroundColor: generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.RED),
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  inner: {
    position: 'absolute',
    backgroundColor: 'red',
  },
});
