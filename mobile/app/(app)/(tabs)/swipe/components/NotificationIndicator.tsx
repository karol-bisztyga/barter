import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Flag3Icon } from '../../../utils/icons';

const ICON_SIZE = 24;

type NotificationIndicatorProps = {
  iconSize: number;
};

export const NotificationIndicator = ({ iconSize }: NotificationIndicatorProps) => {
  const notificationIndicatorSize = iconSize / 3;
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
      <Flag3Icon width={ICON_SIZE} height={ICON_SIZE} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
