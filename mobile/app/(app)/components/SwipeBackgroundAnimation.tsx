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
  IconName,
  Item,
  SwipeBackgroundAnimationDirection,
} from './SwipeBackgroundAnimationItem';
import { generateRandomHarmonicColor } from '../utils/harmonicColors';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../constants';

export const getIconForSwipeDirection = (swipeDirection: SwipeDirection | null): IconName => {
  'worklet';
  switch (swipeDirection) {
    case SwipeDirection.LEFT:
      return 'TorchIcon';
    case SwipeDirection.RIGHT:
      return 'PaperIcon';
    case SwipeDirection.DOWN:
      return 'SandGlassIcon';
    default:
      return null;
  }
};

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

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
      items.push({ x, y, size, color: generateRandomHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR) });
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
  const [iconName, setIconName] = React.useState<IconName>(null);
  const icon = useSharedValue<SwipeBackgroundAnimationDirection>(null);

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
      icon.value = prepared;

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
      swipeIntensity.value = prepared;
    }
  );

  const opacityStartingIntensity = useSharedValue<number>(0);

  useAnimatedReaction(
    () => {
      if (swipeDirection.value == null || regenerateItems || !items.length) {
        return 0;
      }
      return swipeIntensity.value;
    },
    (prepared, previous) => {
      if (previous !== 0) {
        return;
      }
      opacityStartingIntensity.value = prepared;
    }
  );

  useAnimatedReaction(
    () => {
      if (swipeDirection.value == null || regenerateItems || !items.length) {
        return 0;
      }
      return swipeIntensity.value - opacityStartingIntensity.value;
    },
    (prepared, previous) => {
      if (previous === prepared) {
        return;
      }
      opacity.value = prepared;
    }
  );

  useAnimatedReaction(
    () => {
      return swipeDirection.value;
    },
    (prepared) => {
      runOnJS(setIconName)(getIconForSwipeDirection(prepared));
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
          iconName={iconName}
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
