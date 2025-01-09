import React, { useContext, useEffect } from 'react';
import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withTiming,
  SharedValue,
  clamp,
  interpolate,
  ReduceMotion,
} from 'react-native-reanimated';
import { ItemData, SwipeCallbacks } from '../types';
import { useUserContext } from '../context/UserContext';
import CardItem from './CardItem';
import { PaperIcon, SandGlassIcon, Torch2Icon } from '../utils/icons';
import { useJokerContext } from '../context/JokerContext';
import { hexToRgbaString } from '../utils/harmonicColors';
import { BROWN_COLOR_3, GOLD_COLOR_2 } from '../constants';
import Constants from 'expo-constants';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSettingsContext } from '../context/SettingsContext';
import { GoldGradient } from '../genericComponents/gradients/GoldGradient';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * width;
export const SWIPE_THRESHOLD_VERTICAL = 0.25 * height;
// this treshold says if the the horizontal swipe can be performed
// if the left/right swipe goes beyond that treshold vertically it will not be performed
export const SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL = 50;
const END_ANIMATION_DURATION = 200;
const DECIDE_ICON_WRAPPER_SIZE = 95;
const DECIDE_ICON_SIZE = 44;

export const CARD_DIMENSIONS = {
  width: width - 40, // ratio 2
  height: (3 / 2) * (width - 36), // ratio 3;
};

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
  const jokerContext = useJokerContext();
  const settingsContext = useSettingsContext();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const dragging = useSharedValue(false);

  const rotate = useSharedValue('0deg');

  const cardOpacity = useSharedValue(0);

  const statusBarHeight =
    Platform.select({
      ios: Constants.statusBarHeight, // Height on iOS
      android: StatusBar.currentHeight, // Height on Android
    }) || 0;
  const tabBarHeight = useContext(BottomTabBarHeightContext) || 0;

  const wrapperHeight = height - statusBarHeight - tabBarHeight;
  const wrapperWidth = width;

  const getBackToStartingPosition = () => {
    'worklet';

    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring('0deg');
  };

  const completeAnimations = useSharedValue(0);

  const resetPositionAfterSwipe = () => {
    'worklet';
    lockGesture.value = true;
    translateY.value = -height * 2;
    translateX.value = -width / 2;
    cardOpacity.value = 0;

    rotate.value = withSpring('0deg');

    const completeAnimation = () => {
      'worklet';
      completeAnimations.value = completeAnimations.value + 1;
      if (completeAnimations.value === 2) {
        lockGesture.value = false;
        completeAnimations.value = 0;
      }
    };

    cardOpacity.value = withTiming(1, { duration: 1000 }, completeAnimation);

    translateX.value = withSpring(
      0,
      {
        mass: 1,
        damping: 20,
        stiffness: 200,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
        reduceMotion: ReduceMotion.System,
      },
      completeAnimation
    );
    translateY.value = withSpring(
      0,
      {
        mass: 1,
        damping: 20,
        stiffness: 200,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
        reduceMotion: ReduceMotion.System,
      },
      completeAnimation
    );
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
      rotate.value = `${translateX.value / 20}deg`;
    })
    .onEnd(() => {
      dragging.value = false;
      const horizontalModifier = Math.abs(translateX.value);
      if (translateY.value > SWIPE_THRESHOLD_VERTICAL) {
        if (horizontalModifier > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL * 2) {
          getBackToStartingPosition();
          return;
        }
        runOnJS(settingsContext.playSound)('whooshLo');
        translateY.value = withTiming(height * 2, { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(swipeCallbacks.onSwipeDown)();
        });
        return;
      }
      if (userContext.swipingLeftRightBlockedReason) {
        if (Math.abs(translateX.value) > SWIPE_THRESHOLD_HORIZONTAL) {
          runOnJS(jokerContext.showInfo)(userContext.swipingLeftRightBlockedReason);
        }
        getBackToStartingPosition();
        return;
      }
      if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
        getBackToStartingPosition();
        return;
      }
      if (translateY.value < -(SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL * 2)) {
        getBackToStartingPosition();
        return;
      }
      if (translateX.value > SWIPE_THRESHOLD_HORIZONTAL) {
        lockGesture.value = true;
        runOnJS(settingsContext.playSound)('writing');
        translateX.value = withTiming(width * 2, { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(swipeCallbacks.onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD_HORIZONTAL) {
        lockGesture.value = true;
        runOnJS(settingsContext.playSound)('fire');
        translateX.value = withTiming(-(width * 2), { duration: END_ANIMATION_DURATION }, () => {
          runOnJS(swipeCallbacks.onSwipeLeft)();
        });
      } else {
        getBackToStartingPosition();
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: rotate.value },
      ],
    };
  });

  const decideIconLeftAnimatedStyle = useAnimatedStyle(() => {
    const absTranslateY = Math.abs(translateY.value);
    let scaleModifierImportant = 0;

    if (absTranslateY > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scaleModifierImportant = (absTranslateY - SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) / 100;
    }

    let scale = 1;
    if (translateX.value < 0) {
      scale = clamp(1 + (-translateX.value * 2) / 100, 1, 2);
    } else {
      scale = 1 - clamp(translateX.value / 100, 0, 0.5);
    }

    if (absTranslateY > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scale = clamp(scale - scaleModifierImportant, 0.5, 2);
    }

    const tx = interpolate(scale, [0.5, 1, 2], [-DECIDE_ICON_SIZE * 2.1, 0, DECIDE_ICON_SIZE / 2]);

    return {
      transform: [{ scale }, { translateX: tx }],
    };
  });

  const decideIconRightAnimatedStyle = useAnimatedStyle(() => {
    const absTranslateY = Math.abs(translateY.value);
    let scaleModifierImportant = 0;

    if (absTranslateY > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scaleModifierImportant = (absTranslateY - SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) / 100;
    }

    let scale = 1;
    if (translateX.value > 0) {
      scale = clamp(1 + (translateX.value * 2) / 100, 1, 2);
    } else {
      scale = 1 - clamp(-translateX.value / 100, 0, 0.5);
    }

    if (absTranslateY > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      scale = clamp(scale - scaleModifierImportant, 0.5, 2);
    }

    const tx = interpolate(scale, [0.5, 1, 2], [DECIDE_ICON_SIZE * 2.1, 0, -DECIDE_ICON_SIZE / 2]);

    return {
      transform: [{ scale }, { translateX: tx }],
    };
  });

  const decideIconBottomAnimatedStyle = useAnimatedStyle(() => {
    let scale = 1;
    let ty = 0;

    if (translateY.value > 0) {
      scale = interpolate(translateY.value, [0, SWIPE_THRESHOLD_VERTICAL], [1, 1.5]);
    }
    scale = clamp(scale, 1, 1.5);

    if (translateY.value > 0) {
      ty = interpolate(translateY.value, [0, SWIPE_THRESHOLD_VERTICAL], [0, -DECIDE_ICON_SIZE]);
    } else {
      ty = -translateY.value;
    }
    ty = clamp(ty + Math.abs(translateX.value), -DECIDE_ICON_SIZE, DECIDE_ICON_SIZE * 4);

    return {
      transform: [
        {
          scale,
        },
        {
          translateY: ty,
        },
      ],
    };
  });

  const opacityAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
    };
  });

  useEffect(() => {
    if (!itemData) {
      return;
    }
    resetPositionAfterSwipe();
  }, [itemData]);

  const cardMarginTop = (height - statusBarHeight - tabBarHeight - CARD_DIMENSIONS.height) / 2;

  return (
    <Animated.View style={[styles.container, opacityAnimatedStyle]}>
      {/* <SwipeBackgroundAnimation
        swipeDirection={swipeDirection}
        cardTranslateX={translateX}
        cardTranslateY={translateY}
      /> */}
      {/* card */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.itemWrapper,
            {
              marginTop: cardMarginTop,
              marginHorizontal: (width - CARD_DIMENSIONS.width) / 2,
            },
            cardAnimatedStyle,
          ]}
        >
          <GoldGradient>
            <CardItem
              itemData={itemData}
              onPressMore={onPressMore}
              cardHeight={CARD_DIMENSIONS.height}
            />
          </GoldGradient>
        </Animated.View>
      </GestureDetector>
      {/* left icon */}
      <Animated.View
        style={[
          styles.decideIconWrapper,
          {
            top: wrapperHeight / 2 - DECIDE_ICON_WRAPPER_SIZE / 2,
          },
          styles.decideIconWrapperLeft,
          decideIconLeftAnimatedStyle,
          opacityAnimatedStyle,
        ]}
      >
        <Torch2Icon width={DECIDE_ICON_SIZE} height={DECIDE_ICON_SIZE} style={styles.decideIcon} />
      </Animated.View>
      {/* right icon */}
      <Animated.View
        style={[
          styles.decideIconWrapper,
          {
            top: wrapperHeight / 2 - DECIDE_ICON_WRAPPER_SIZE / 2,
          },
          styles.decideIconWrapperRight,
          decideIconRightAnimatedStyle,
          opacityAnimatedStyle,
        ]}
      >
        <PaperIcon width={DECIDE_ICON_SIZE} height={DECIDE_ICON_SIZE} style={styles.decideIcon} />
      </Animated.View>
      {/* bottom icon */}
      <Animated.View
        style={[
          styles.decideIconWrapper,
          {
            top: cardMarginTop + CARD_DIMENSIONS.height - DECIDE_ICON_WRAPPER_SIZE / 2,
          },
          styles.decideIconWrapperBottom,
          decideIconBottomAnimatedStyle,
          opacityAnimatedStyle,
          {
            marginRight: wrapperWidth / 2,
          },
        ]}
      >
        <SandGlassIcon
          width={DECIDE_ICON_SIZE}
          height={DECIDE_ICON_SIZE}
          style={styles.decideIcon}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  itemWrapper: {
    width: CARD_DIMENSIONS.width,
    height: CARD_DIMENSIONS.height,
    backgroundColor: 'white',
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 30,
  },
  decideIconWrapper: {
    position: 'absolute',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: DECIDE_ICON_WRAPPER_SIZE,
    height: DECIDE_ICON_WRAPPER_SIZE,
    borderWidth: 1,
    borderColor: GOLD_COLOR_2,
    backgroundColor: hexToRgbaString(BROWN_COLOR_3, 0.65),
  },
  decideIcon: {
    color: 'black',
    width: DECIDE_ICON_SIZE,
    height: DECIDE_ICON_SIZE,
    textAlign: 'center',
    lineHeight: DECIDE_ICON_SIZE,
  },
  decideIconWrapperLeft: {
    marginLeft: 20,
    left: -DECIDE_ICON_WRAPPER_SIZE / 2,
  },
  decideIconWrapperRight: {
    marginRight: 20,
    right: -DECIDE_ICON_WRAPPER_SIZE / 2,
  },
  decideIconWrapperBottom: {
    right: -DECIDE_ICON_WRAPPER_SIZE / 2,
  },
});

export default SwipeableCard;
