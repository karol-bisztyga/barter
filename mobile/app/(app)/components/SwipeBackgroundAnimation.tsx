import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  clamp,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { SwipeDirection, ViewDimensions } from '../types';
import SwipeBackgroundAnimatedItem, {
  Item,
  SwipeBackgroundAnimatedItemIconType,
} from './SwipeBackgroundAnimationItem';

const getIconForSwipeDirection = (swipeDirection: SwipeDirection | null) => {
  'worklet';
  console.log('icons for swipe dir', swipeDirection);
  switch (swipeDirection) {
    case SwipeDirection.LEFT:
      return 'remove';
    case SwipeDirection.RIGHT:
      return 'bomb';
    case SwipeDirection.DOWN:
      return 'clock-o';
    default:
      return '';
  }
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

const MIN_SIZE = 20;
const MAX_SIZE = 50;
const ITEM_COUNT = 50;
const DISTANCE = 20;
const GENERATE_ATTEMPTS_LIMIT = 100;

const { width, height } = Dimensions.get('window');

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
  const [icon, setIcon] = useState<SwipeBackgroundAnimatedItemIconType>('');

  const opacity = useSharedValue(0);
  const swipeIntensity = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return swipeDirection.value;
    },
    (prepared, previous) => {
      if (previous === prepared) {
        return;
      }
      const newIcon = getIconForSwipeDirection(prepared);
      runOnJS(setIcon)(newIcon);

      if (prepared !== null || containerDimensions === null) {
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
        return clamp(cardTranslateY.value / (height / 2), 0, 1);
      }
      return clamp(Math.abs(cardTranslateX.value) / (width / 2), 0, 1);
    },
    (prepared, previous) => {
      if (prepared === previous) {
        return;
      }
      // console.log('swipeIntensity update', prepared);
      swipeIntensity.value = prepared;
    }
  );

  useAnimatedReaction(
    () => {
      if (swipeDirection.value == null || regenerateItems || !items.length) {
        return 0;
      }
      return swipeIntensity.value;
    },
    (prepared, previous) => {
      if (previous === prepared) {
        return;
      }
      opacity.value = prepared;
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
    if (containerDimensions === null) {
      return;
    }
    setItems(generateNonCollidingItems(containerDimensions));
  }, [containerDimensions]);

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
        <SwipeBackgroundAnimatedItem
          key={index}
          item={item}
          opacity={opacity}
          swipeIntensity={swipeIntensity}
          icon={icon}
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
