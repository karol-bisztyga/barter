import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SwipeDirection } from '../types';

const MIN_SIZE = 20;
const MAX_SIZE = 50;
const ITEM_COUNT = 50;
const DISTANCE = 20;
const GENERATE_ATTEMPTS_LIMIT = 100;

interface Item {
  x: number;
  y: number;
  size: number;
  color: string;
}

type ViewDimensions = {
  width: number;
  height: number;
};

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const isColliding = (
  x: number,
  y: number,
  size: number,
  items: Item[],
  minDistance: number
): boolean => {
  for (const item of items) {
    const distance = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
    const minRequiredDistance = (item.size + size) / 2 + minDistance;
    if (distance < minRequiredDistance) {
      return true; // Items are too close or colliding
    }
  }
  return false;
};

const checkIfFitsInScreen = (
  x: number,
  y: number,
  size: number,
  containerDimensions: ViewDimensions
) => {
  return (
    x >= 0 &&
    x + size <= containerDimensions.width &&
    y >= 0 &&
    y + size <= containerDimensions.height
  );
};

const generateNonCollidingItems = (containerDimensions: ViewDimensions): Item[] => {
  const items: Item[] = [];
  let attempts = 0;

  while (items.length < ITEM_COUNT && attempts < GENERATE_ATTEMPTS_LIMIT) {
    const size = getRandomInt(MIN_SIZE, MAX_SIZE);
    const x = getRandomInt(0, containerDimensions.width - size);
    const y = getRandomInt(0, containerDimensions.height - size);

    if (
      !isColliding(x, y, size, items, DISTANCE) &&
      checkIfFitsInScreen(x, y, size, containerDimensions)
    ) {
      items.push({ x, y, size, color: getRandomColor() });
    } else {
      attempts++;
    }
  }

  return items;
};

const getRandomShakeModifier = () => {
  return Math.round(Math.random() * 6 - 3);
};

interface AnimatedItemProps {
  item: Item;
  swipeDirection: SharedValue<SwipeDirection | null>;
  opacity: SharedValue<number>;
  swipeIntensity: SharedValue<number>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({
  item,
  swipeDirection,
  opacity,
  swipeIntensity,
}) => {
  // const scale = useSharedValue(1);
  const itemTranslateX = useSharedValue(0);
  const itemTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return swipeIntensity.value;
    },
    (prepared, previous) => {
      if (prepared === previous) {
        return;
      }
      console.log('swipeIntensity ### ', prepared, previous);
    }
  );

  // useEffect(() => {
  //   // Create a pulse effect for scaling
  //   scale.value = withTiming(1.5, { duration: 1000 }, () => {
  //     scale.value = withTiming(1, { duration: 1000 });
  //   });
  // }, [scale]);

  // useEffect(() => {
  const beginTremble = () => {
    const modifierX = getRandomShakeModifier();
    const modifierY = getRandomShakeModifier();
    const timeXModifier = Math.random() * 30 + 50;
    const timeYModifier = Math.random() * 30 + 50;
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
  };
  // }, []);

  useAnimatedReaction(
    () => {
      return swipeDirection.value;
    },
    (prepared, previous) => {
      if (previous === prepared) {
        return;
      }
      // console.log('swipe direction changed', previous, prepared);
      const newOpacity = prepared === null ? 0 : 1;
      opacity.value = withTiming(newOpacity, { duration: 500 });

      // if (prepared === null) {
      //   translateX.value = 0;
      //   translateY.value = 0;
      // } else {
      //   runOnJS(beginTremble)();
      // }
    }
  );

  // useEffect(() => {
  //   if (visible) {
  //     opacity.value = withTiming(1, { duration: 500 });
  //   } else {
  //     opacity.value = withTiming(0, { duration: 500 });
  //   }
  // }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    // console.log('here', opacity.value);
    return {
      // transform: [{ scale: scale.value }],
      opacity: opacity.value,
      transform: [{ translateX: itemTranslateX.value }, { translateY: itemTranslateY.value }],
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          width: item.size,
          height: item.size,
          backgroundColor: item.color,
          // borderRadius: item.size / 2,
          transform: [{ rotateX: '45deg' }],
          left: item.x,
          top: item.y,
        },
      ]}
    />
  );
};

const SwipeBackgroundAnimation = ({
  swipeDirection,
  cardTranslateX,
  cardTranslateY,
}: {
  swipeDirection: SharedValue<SwipeDirection | null>;
  cardTranslateX: SharedValue<number>;
  cardTranslateY: SharedValue<number>;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [containerDimensions, setContainerDimensions] = useState<ViewDimensions | null>(null);
  const [regenerateItems, setRegenerateItems] = useState(false);

  const opacity = useSharedValue(0);
  const swipeIntensity = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return swipeDirection.value;
    },
    (prepared, previous) => {
      if (previous === prepared) {
        // || prepared === null || containerDimensions === null) {
        return;
      }
      console.log('swipe direction changed', previous, prepared);
      const newOpacity = prepared === null ? 0 : 1;
      opacity.value = withTiming(newOpacity, { duration: 500 });
      if (prepared === null || containerDimensions === null) {
        return;
      }
      runOnJS(setRegenerateItems)(true);
    }
  );

  useAnimatedReaction(
    () => {
      if (swipeDirection.value === null) {
        return 0;
      }
      if (swipeDirection.value === SwipeDirection.DOWN) {
        return cardTranslateY.value;
      }
      return Math.abs(cardTranslateX.value);
    },
    (prepared, previous) => {
      if (prepared === previous) {
        return;
      }
      // console.log('swipeIntensity update', prepared);
      swipeIntensity.value = prepared;
    }
  );

  // useAnimatedReaction(
  //   () => {
  //     return swipeIntensity.value;
  //   },
  //   (prepared, previous) => {
  //     if (previous === prepared || prepared === 0) {
  //       return;
  //     }
  //     console.log('swipe intensity changed', previous, prepared);
  //   }
  // );

  useEffect(() => {
    if (!regenerateItems || containerDimensions === null) {
      return;
    }
    setItems(generateNonCollidingItems(containerDimensions));
    setRegenerateItems(false);
  }, [regenerateItems]);

  // useEffect(() => {
  //   if (!containerDimensions || swipeDirection.value === null) {
  //     return;
  //   }
  //   console.log('set items');
  //   setItems(generateNonCollidingItems(containerDimensions));
  // }, [containerDimensions, swipeDirection.value]);

  // once the swipe direction is set, change the opacity of elements to 1 and start tremble + when swiped, make some other animation

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        console.log(e.nativeEvent.layout);
        setContainerDimensions({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        });
      }}
    >
      {items.map((item, index) => (
        <AnimatedItem
          key={index}
          item={item}
          swipeDirection={swipeDirection}
          opacity={opacity}
          swipeIntensity={swipeIntensity}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default SwipeBackgroundAnimation;
