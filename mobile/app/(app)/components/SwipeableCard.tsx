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
import { ItemData } from '../types';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const MAX_RADIUS = 30;
const END_ANIMATION_DURATION = 200;

const SwipeableCard = ({
  itemData,
  onSwipeRight,
  onSwipeLeft,
  lockGesture,
  onPressMore,
}: {
  itemData: ItemData;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onPressMore: () => void;
  lockGesture: SharedValue<boolean>;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const rotate = useSharedValue('0deg');
  const dragging = useSharedValue(false);

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
      if (translateX.value > SWIPE_THRESHOLD) {
        lockGesture.value = true;
        translateX.value = withTiming(width * 2, { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        lockGesture.value = true;
        translateX.value = withTiming(-(width * 2), { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring('0deg');
      }
    });

  const radius = useDerivedValue(() => {
    const tx = Math.abs(translateX.value);
    if (tx > SWIPE_THRESHOLD) {
      return MAX_RADIUS;
    }
    return (tx / SWIPE_THRESHOLD) * MAX_RADIUS;
  });

  const shadowColor = useDerivedValue(() => {
    if (!dragging.value) {
      return 'black';
    }
    return translateX.value > 0 ? 'green' : 'red';
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: rotate.value },
      ],
      shadowRadius: dragging.value ? radius.value : 1,
      shadowColor: shadowColor.value,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.itemWrapper, animatedStyle]}>
        <Item itemData={itemData} centerVertically={false} onPressMore={onPressMore} />
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
