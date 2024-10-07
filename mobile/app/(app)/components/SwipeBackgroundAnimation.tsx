import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
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

interface AnimatedItemProps {
  item: Item;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ item }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Create a pulse effect for scaling
    scale.value = withTiming(1.5, { duration: 1000 }, () => {
      scale.value = withTiming(1, { duration: 1000 });
    });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
}: {
  swipeDirection: SharedValue<SwipeDirection | null>;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [containerDimensions, setContainerDimensions] = useState<ViewDimensions | null>(null);
  const [regenerateItems, setRegenerateItems] = useState(false);

  useAnimatedReaction(
    () => {
      return swipeDirection.value;
    },
    (prepared, previous) => {
      if (previous === prepared || prepared === null || containerDimensions === null) {
        return;
      }
      console.log('swipe direction changed', previous, prepared);
      runOnJS(setRegenerateItems)(true);
    }
  );

  useEffect(() => {
    if (!regenerateItems || containerDimensions === null) {
      return;
    }
    setItems(generateNonCollidingItems(containerDimensions));
    setRegenerateItems(false);
  }, [regenerateItems]);

  useEffect(() => {
    if (!containerDimensions || swipeDirection.value === null) {
      return;
    }
    console.log('set items');
    setItems(generateNonCollidingItems(containerDimensions));
  }, [containerDimensions, swipeDirection.value]);

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
        <AnimatedItem key={index} item={item} />
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
