import React, { useContext, useEffect } from 'react';
import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useDerivedValue,
  withTiming,
  SharedValue,
  clamp,
  interpolate,
  useAnimatedReaction,
  ReduceMotion,
} from 'react-native-reanimated';
import { ItemData, SwipeCallbacks, SwipeDirection } from '../types';
import { useUserContext } from '../context/UserContext';
import CardItem from './CardItem';
import SwipeBackgroundAnimation from './SwipeBackgroundAnimation';
import { PaperIcon, SandGlassIcon, TorchIcon } from '../utils/icons';
import { useJokerContext } from '../context/JokerContext';
import { generateHarmonicColor, TargetColor } from '../utils/harmonicColors';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../constants';
import Constants from 'expo-constants';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSettingsContext } from '../context/SettingsContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * width;
export const SWIPE_THRESHOLD_VERTICAL = 0.25 * height;
// this treshold says if the the horizontal swipe can be performed
// if the left/right swipe goes beyond that treshold vertically it will not be performed
export const SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL = 50;
const MAX_RADIUS = 30;
const END_ANIMATION_DURATION = 200;
const DECIDE_ICON_SIZE = 100;

const CARD_DIMENSIONS = {
  width: width - 36, // ratio 2
  height: (3 / 2) * (width - 36), // ratio 3};
};

const DECISION_COLORS = {
  LEFT: generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.RED),
  RIGHT: generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.GREEN),
  BOTTOM: generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.YELLOW),
  NONE: '',
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
  const swipeDirection = useSharedValue<SwipeDirection | null>(null);

  const rotate = useSharedValue('0deg');

  const forceControlsScale = useSharedValue(1);
  const forceControlsOpacity = useSharedValue(1);

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
      if (translateY.value > SWIPE_THRESHOLD_VERTICAL) {
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

  useAnimatedReaction(
    () => {
      if (!dragging.value) {
        return null;
      }
      if (translateY.value > SWIPE_THRESHOLD_VERTICAL) {
        return SwipeDirection.DOWN;
      }
      // if (translateY.value > SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
      //   return null;
      // }
      if (Math.abs(translateX.value) < SWIPE_THRESHOLD_VERTICAL_FOR_HORIZONTAL) {
        return null;
      }
      if (translateX.value > 0) {
        return SwipeDirection.RIGHT;
      }
      return SwipeDirection.LEFT;
    },
    (prepared, previous) => {
      if (prepared === previous) {
        return;
      }
      swipeDirection.value = prepared;
    }
  );

  const shadowColor = useDerivedValue(() => {
    switch (swipeDirection.value) {
      case SwipeDirection.DOWN:
        return DECISION_COLORS.BOTTOM;
      case SwipeDirection.LEFT:
        return DECISION_COLORS.LEFT;
      case SwipeDirection.RIGHT:
        return DECISION_COLORS.RIGHT;
      case null:
        return DECISION_COLORS.NONE;
    }
  });

  const shadowRadius = useDerivedValue(() => {
    const tx = Math.abs(translateX.value);
    const ty = translateY.value;

    switch (shadowColor.value) {
      case DECISION_COLORS.BOTTOM:
        if (ty > SWIPE_THRESHOLD_VERTICAL) {
          return MAX_RADIUS;
        }
        return (ty / SWIPE_THRESHOLD_VERTICAL) * MAX_RADIUS;
      case DECISION_COLORS.RIGHT:
      case DECISION_COLORS.LEFT:
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

  const decideIconBottomAnimatedStyle = useAnimatedStyle(() => {
    let scale = 1;
    if (translateY.value > 0) {
      scale = interpolate(translateY.value, [0, SWIPE_THRESHOLD_VERTICAL], [1, 1.5]);
    }
    scale = clamp(scale, 1, 1.5);

    let ty = 0;
    if (translateY.value > 0) {
      ty = interpolate(translateY.value, [0, SWIPE_THRESHOLD_VERTICAL], [0, -DECIDE_ICON_SIZE / 8]);
    } else {
      ty = -translateY.value;
    }
    ty = clamp(ty, (-DECIDE_ICON_SIZE / 8) * 3, DECIDE_ICON_SIZE);

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

  const forcedControlsParametersAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: forceControlsOpacity.value,
      transform: [{ scale: forceControlsScale.value }],
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

  return (
    <Animated.View style={[styles.container, opacityAnimatedStyle]}>
      <SwipeBackgroundAnimation
        swipeDirection={swipeDirection}
        cardTranslateX={translateX}
        cardTranslateY={translateY}
      />
      {/* card */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.itemWrapper,
            {
              marginTop: (height - statusBarHeight - tabBarHeight - CARD_DIMENSIONS.height) / 2,
            },
            cardAnimatedStyle,
          ]}
        >
          <CardItem itemData={itemData} onPressMore={onPressMore} />
        </Animated.View>
      </GestureDetector>
      {/* left icon */}
      <Animated.View
        style={[
          styles.decideIconWrapper,
          {
            top: wrapperHeight / 2 - DECIDE_ICON_SIZE / 2,
          },
          styles.decideIconWrapperLeft,
          decideIconLeftAnimatedStyle,
          opacityAnimatedStyle,
          forcedControlsParametersAnimatedStyle,
        ]}
      >
        <TorchIcon width={DECIDE_ICON_SIZE} height={DECIDE_ICON_SIZE} style={styles.decideIcon} />
      </Animated.View>
      {/* right icon */}
      <Animated.View
        style={[
          styles.decideIconWrapper,
          {
            top: wrapperHeight / 2 - DECIDE_ICON_SIZE / 2,
          },
          styles.decideIconWrapperRight,
          decideIconRightAnimatedStyle,
          opacityAnimatedStyle,
          forcedControlsParametersAnimatedStyle,
        ]}
      >
        <PaperIcon width={DECIDE_ICON_SIZE} height={DECIDE_ICON_SIZE} style={styles.decideIcon} />
      </Animated.View>
      {/* bottom icon */}
      <Animated.View
        style={[
          styles.decideIconWrapper,
          {
            bottom: -DECIDE_ICON_SIZE / 2,
          },
          styles.decideIconWrapperBottom,
          decideIconBottomAnimatedStyle,
          opacityAnimatedStyle,
          forcedControlsParametersAnimatedStyle,
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
    backgroundColor: 'black',
    borderRadius: 5,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 30,
    marginHorizontal: 18,
  },
  decideIconWrapper: {
    position: 'absolute',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: DECIDE_ICON_SIZE,
    height: DECIDE_ICON_SIZE,
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
    left: -(DECIDE_ICON_SIZE + 20) / 2,
  },
  decideIconWrapperRight: {
    marginRight: 20,
    right: -(DECIDE_ICON_SIZE + 20) / 2,
  },
  decideIconWrapperBottom: {
    marginBottom: 20,
    right: -DECIDE_ICON_SIZE / 2,
  },
});

export default SwipeableCard;
