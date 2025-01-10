import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RED_COLOR } from './(app)/constants';
import { Flag2Icon } from './(app)/utils/icons';
import TextWrapper from './(app)/genericComponents/TextWrapper';
import { GoldGradient } from './(app)/genericComponents/gradients/GoldGradient';

const ICON_SIZE = 32;
const BORDER_WIDTH = 2;

type ErrorBoxProps = {
  message: string;
};

export const ErrorBox = ({ message }: ErrorBoxProps) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GoldGradient />
      <View style={styles.wrapper}>
        <Flag2Icon
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={[
            styles.icon,
            {
              transform: [{ rotate: `-4deg` }],
            },
          ]}
        />
        <TextWrapper style={styles.label}>{message}</TextWrapper>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  wrapper: {
    margin: BORDER_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED_COLOR,
    padding: 14,
  },
  icon: {
    margin: 10,
    marginLeft: 0,
  },
  label: {
    fontSize: 16,
    flex: 1,
    lineHeight: 23,
  },
});
