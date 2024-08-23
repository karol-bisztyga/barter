import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useDerivedValue,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import Item from './Item';
import { ItemData, SwipeCallbacks } from '../types';
import { useUserContext } from '../context/UserContext';
import { showInfo } from '../utils/notifications';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * width;
const SWIPE_THRESHOLD_VERTICAL = 0.25 * height;
const MAX_RADIUS = 30;
const END_ANIMATION_DURATION = 200;

const SwipeableCard = ({
  itemData,
  swipeCallbacks,
  lockGesture,
  onPressMore,
}: {
  itemData: ItemData;
  swipeCallbacks: SwipeCallbacks;
  onPressMore: () => void;
  lockGesture: SharedValue<boolean>;
}) => {
  const userContext = useUserContext();

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

  const animatedStyle = useAnimatedStyle(() => {
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

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.itemWrapper, animatedStyle]}>
        <Item
          itemData={itemData}
          centerVertically={false}
          onPressMore={onPressMore}
          carouselOptions={{ actionPanelVisible: true }}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 30,
  },
});

export default SwipeableCard;
