import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useDerivedValue,
  withTiming,
  SharedValue,
  useAnimatedReaction,
  clamp,
} from 'react-native-reanimated';
import { ItemData, SwipeCallbacks } from '../types';
import { useUserContext } from '../context/UserContext';
import { showInfo } from '../utils/notifications';
import CardItem from './CardItem';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * width;
const SWIPE_THRESHOLD_VERTICAL = 0.25 * height;
// this treshold says if the the horizontal swipe can be performed
// if the left/right swipe goes beyond that treshold vertically it will not be performed
const SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL = 50;
const MAX_RADIUS = 30;
const END_ANIMATION_DURATION = 200;
const DECIDE_ICON_SIZE = 100;

const SwipeableCard = ({
  itemData,
  swipeCallbacks,
  lockGesture,
  onPressMore,
  currentCardIndex,
  cardsLength,
}: {
  itemData: ItemData;
  swipeCallbacks: SwipeCallbacks;
  onPressMore: () => void;
  lockGesture: SharedValue<boolean>;
  currentCardIndex: number;
  cardsLength: number;
}) => {
  const userContext = useUserContext();

  const [wrapperHeight, setWrapperHeight] = useState<number | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const rotate = useSharedValue('0deg');
  const dragging = useSharedValue(false);

  const getBackToStartingPosition = () => {
    'worklet';
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring('0deg');
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      translateX.value = 0;
      translateY.value = 0;
      rotate.value = '0deg';
    })
    .onUpdate((event) => {
      if (lockGesture.value) {
        return;
      }
      dragging.value = true;
      translateX.value = event.translationX;

      translateY.value = event.translationY;
      velocityX.value = event.velocityX;
      velocityY.value = event.velocityY;
      rotate.value = `${translateX.value / 20}deg`;
    })
    .onEnd(() => {
      dragging.value = false;
      if (translateY.value > SWIPE_THRESHOLD_VERTICAL) {
        translateY.value = withTiming(height * 2, { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(swipeCallbacks.onSwipeDown)();
        });
        return;
      }
      if (userContext.swipingLeftRightBlockedReason) {
        runOnJS(showInfo)('swiping left right blocked', userContext.swipingLeftRightBlockedReason);
        getBackToStartingPosition();
        return;
      }
      if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
        getBackToStartingPosition();
        return;
      }
      if (translateX.value > SWIPE_THRESHOLD_HORIZONTAL) {
        lockGesture.value = true;
        translateX.value = withTiming(width * 2, { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(swipeCallbacks.onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD_HORIZONTAL) {
        lockGesture.value = true;
        translateX.value = withTiming(-(width * 2), { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(swipeCallbacks.onSwipeLeft)();
        });
      } else {
        getBackToStartingPosition();
      }
    });

  const shadowColor = useDerivedValue(() => {
    if (!dragging.value) {
      return 'black';
    }
    if (translateY.value > SWIPE_THRESHOLD_VERTICAL) {
      return 'yellow';
    }
    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      return 'black';
    }
    return translateX.value > 0 ? 'green' : 'red';
  });

  const shadowRadius = useDerivedValue(() => {
    const tx = Math.abs(translateX.value);
    const ty = translateY.value;

    switch (shadowColor.value) {
      case 'yellow':
        if (ty > SWIPE_THRESHOLD_VERTICAL) {
          return MAX_RADIUS;
        }
        return (ty / SWIPE_THRESHOLD_VERTICAL) * MAX_RADIUS;
      case 'green':
      case 'red':
        if (tx > SWIPE_THRESHOLD_HORIZONTAL) {
          return MAX_RADIUS;
        }
        return (tx / SWIPE_THRESHOLD_HORIZONTAL) * MAX_RADIUS;
      default:
        return 1;
    }
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: rotate.value },
      ],
      shadowRadius: dragging.value ? shadowRadius.value : 1,
      shadowColor: shadowColor.value,
    };
  });

  const decideIconLeftAnimatedStyle = useAnimatedStyle(() => {
    // calculate scale
    let scaleModifierImportant = 0;
    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scaleModifierImportant = (translateY.value - SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) / 100;
    }

    let scale = 1;
    if (translateX.value < 0) {
      scale = clamp(1 + (-translateX.value * 2) / 100, 1, 2);
    } else {
      scale = 1 - clamp(translateX.value / 100, 0, 0.5);
    }

    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scale = clamp(scale - scaleModifierImportant, 0.5, 2);
    }

    // calculate translateX
    let tx = 0;
    if (translateX.value < 0) {
      tx = clamp(-translateX.value, 0, DECIDE_ICON_SIZE / 2);
    } else {
      tx = -translateX.value;
    }
    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      tx = clamp(
        -(translateX.value + translateY.value - SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL),
        -DECIDE_ICON_SIZE,
        DECIDE_ICON_SIZE / 2
      );
    }

    return {
      transform: [
        {
          scale,
        },
        {
          translateX: tx,
        },
      ],
    };
  });

  const decideIconRightAnimatedStyle = useAnimatedStyle(() => {
    // calculate scale
    let scaleModifierImportant = 0;
    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scaleModifierImportant = (translateY.value - SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) / 100;
    }

    let scale = 1;
    if (translateX.value > 0) {
      scale = clamp(1 + (translateX.value * 2) / 100, 1, 2);
    } else {
      scale = 1 - clamp(-translateX.value / 100, 0, 0.5);
    }

    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scale = clamp(scale - scaleModifierImportant, 0.5, 2);
    }

    // calculate translateX
    let tx = 0;
    if (translateX.value > 0) {
      tx = clamp(-translateX.value, -DECIDE_ICON_SIZE / 2, 0);
    } else {
      tx = -translateX.value;
    }
    if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      tx = clamp(
        tx + translateY.value - SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL,
        -DECIDE_ICON_SIZE / 2,
        DECIDE_ICON_SIZE
      );
    }

    return {
      transform: [
        {
          scale,
        },
        {
          translateX: tx,
        },
      ],
    };
  });

  const isCurrentCardOnTop = currentCardIndex === cardsLength - 1;

  const controlIconsOpacityStyle = {
    opacity: isCurrentCardOnTop ? 1 : 0,
  };

  return (
    <View
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      onLayout={(event) => {
        setWrapperHeight(event.nativeEvent.layout.height);
      }}
    >
      {wrapperHeight && (
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.itemWrapper,
              {
                marginTop: (wrapperHeight - height * 0.7) / 2,
              },
              cardAnimatedStyle,
            ]}
          >
            <CardItem itemData={itemData} onPressMore={onPressMore} />
          </Animated.View>
        </GestureDetector>
      )}
      {wrapperHeight && (
        <Animated.View
          style={[
            styles.decideIconWrapper,
            {
              top: wrapperHeight / 2 - DECIDE_ICON_SIZE / 2,
            },
            styles.decideIconWrapperLeft,
            decideIconLeftAnimatedStyle,
            controlIconsOpacityStyle,
          ]}
        >
          <FontAwesome size={DECIDE_ICON_SIZE} style={styles.decideIcon} name="remove" />
        </Animated.View>
      )}
      {wrapperHeight && (
        <Animated.View
          style={[
            styles.decideIconWrapper,
            {
              top: wrapperHeight / 2 - DECIDE_ICON_SIZE / 2,
            },
            styles.decideIconWrapperRight,
            decideIconRightAnimatedStyle,
            controlIconsOpacityStyle,
          ]}
        >
          <FontAwesome size={DECIDE_ICON_SIZE} style={styles.decideIcon} name="bomb" />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    width: '100%',
    height: height * 0.7,
    backgroundColor: 'black',
    borderRadius: 5,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 30,
  },
  decideIconWrapper: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  decideIcon: {
    color: 'black',
    width: DECIDE_ICON_SIZE,
    height: DECIDE_ICON_SIZE,
    textAlign: 'center',
    lineHeight: DECIDE_ICON_SIZE,
  },
  decideIconWrapperLeft: {
    left: -(DECIDE_ICON_SIZE + 40) / 2,
  },
  decideIconWrapperRight: {
    right: -(DECIDE_ICON_SIZE + 40) / 2,
    transform: [{ scaleX: -1 }],
  },
});

export default SwipeableCard;
