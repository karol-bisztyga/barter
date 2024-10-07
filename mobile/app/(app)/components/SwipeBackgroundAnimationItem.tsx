import React, { useEffect } from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type SwipeBackgroundAnimatedItemIconType = 'bomb' | 'clock-o' | 'remove' | '';

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
  icon: SwipeBackgroundAnimatedItemIconType;
}

const SwipeBackgroundAnimatedItem: React.FC<SwipeBackgroundAnimatedItemProps> = ({
  item,
  opacity,
  swipeIntensity,
  icon,
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

  if (icon === '') {
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
      <FontAwesome size={(item.size * 3) / 4} name={icon} color={'black'} />
    </Animated.View>
  );
};

export default SwipeBackgroundAnimatedItem;
