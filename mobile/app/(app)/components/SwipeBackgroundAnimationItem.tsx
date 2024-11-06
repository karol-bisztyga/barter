import React, { useEffect } from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { PaperIcon, SandGlassIcon, TorchIcon } from '../utils/icons';
import { SwipeDirection } from '../types';

export type IconName = 'TorchIcon' | 'PaperIcon' | 'SandGlassIcon' | null;

export type SwipeBackgroundAnimationDirection = SwipeDirection | null;

export interface Item {
  x: number;
  y: number;
  size: number;
  color: string;
}

interface SwipeBackgroundAnimatedItemProps {
  item: Item;
  opacity: SharedValue<number>;
  swipeIntensity: SharedValue<number>;
  iconName: IconName;
}

const SwipeBackgroundAnimatedItem: React.FC<SwipeBackgroundAnimatedItemProps> = ({
  item,
  opacity,
  swipeIntensity,
  iconName,
}) => {
  const itemTranslateX = useSharedValue(0);
  const itemTranslateY = useSharedValue(0);
  const itemRotation = useSharedValue('0deg');

  const getRandomShakeModifier = (max: number) => {
    return Math.round(Math.random() * max);
  };
  const beginTremble = () => {
    const modifierX = getRandomShakeModifier(2);
    const modifierY = getRandomShakeModifier(2);
    const modifierR = `${getRandomShakeModifier(7)}deg`;

    const timeXModifier = Math.random() * 100 + 50;
    const timeYModifier = Math.random() * 100 + 50;
    const timeRModifier = Math.random() * 100 + 50;
    // Trembling effect: small oscillations in both X and Y directions
    itemTranslateX.value = withRepeat(
      withSequence(
        withTiming(modifierX, { duration: timeXModifier }),
        withTiming(-modifierX, { duration: timeXModifier })
      ),
      -1, // Repeat infinitely
      true // Reverse direction
    );

    itemTranslateY.value = withRepeat(
      withSequence(
        withTiming(modifierY, { duration: timeYModifier }),
        withTiming(-modifierY, { duration: timeYModifier })
      ),
      -1, // Repeat infinitely
      true // Reverse direction
    );

    itemRotation.value = withRepeat(
      withSequence(
        withTiming(modifierR, { duration: timeRModifier }),
        withTiming(`-${modifierR}`, { duration: timeRModifier })
      ),
      -1, // Repeat infinitely
      true // Reverse direction
    );
  };

  useEffect(() => {
    beginTremble();
  }, [swipeIntensity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: itemTranslateX.value },
        { translateY: itemTranslateY.value },
        { rotate: itemRotation.value },
        { scale: 1 + swipeIntensity.value * 2 },
      ],
    };
  });

  const iconSize = (item.size * 3) / 4;

  const renderIcon = () => {
    let Icon = null;
    switch (iconName) {
      case 'TorchIcon':
        Icon = TorchIcon;
        break;
      case 'PaperIcon':
        Icon = PaperIcon;
        break;
      case 'SandGlassIcon':
        Icon = SandGlassIcon;
        break;
    }
    if (Icon === null) {
      return null;
    }
    return (
      <Animated.View style={styles.animatedIconWrapper}>
        <Icon width={iconSize} height={iconSize} fill="black" />
      </Animated.View>
    );
  };

  if (iconName === null) {
    return null;
  }

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          width: item.size,
          height: item.size,
          backgroundColor: item.color,
          transform: [{ rotateX: '45deg' }],
          left: item.x,
          top: item.y,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: item.size / 2,
        },
      ]}
    >
      {renderIcon()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedIconWrapper: {
    position: 'absolute',
  },
});

export default SwipeBackgroundAnimatedItem;
