import { JokerIcon } from '../utils/icons';
import { Dimensions, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { JokerAlert, useJokerContext } from '../context/JokerContext';
import { JokerDialogue } from './JokerDialogue';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const JOKER_SIZE = 50;
const TOP_OFFSET = Constants.statusBarHeight + 4;
const HORIZONTAL_OFFSET = 10;

const Joker = () => {
  const jokerContext = useJokerContext();

  const [currentAlert, setCurrentAlert] = useState<JokerAlert | null>(null);

  const translateX = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const dragging = useSharedValue(false);

  const horizontalBounds = {
    left: HORIZONTAL_OFFSET,
    right: width - JOKER_SIZE - HORIZONTAL_OFFSET,
  };

  const positionX = useSharedValue(horizontalBounds.right);

  const [jokerPressed, setJokerPressed] = useState(false);

  useEffect(() => {
    if (jokerPressed) {
      setJokerPressed(false);
      pressJoker();
    }
  }, [jokerPressed]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (currentAlert) {
        return;
      }
      dragging.value = true;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      velocityX.value = event.velocityX;
    })
    .onEnd(() => {
      if (currentAlert) {
        return;
      }
      const x = clamp(
        positionX.value + translateX.value + velocityX.value * 0.2,
        horizontalBounds.left,
        horizontalBounds.right
      );
      positionX.value = withSpring(x);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    })
    .onFinalize(() => {
      if (currentAlert) {
        return;
      }
      if (!dragging.value) {
        opacity.value = withSpring(0.6, { duration: 100 }, () => {
          opacity.value = withSpring(1, { duration: 100 });
          runOnJS(setJokerPressed)(true);
        });
      }
      dragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: positionX.value,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const pressJoker = () => {
    if (currentAlert) {
      return;
    }

    // TODO this function should do something different, probably say something like "hello I'm your assistant" etc
    const arr = ['error', 'info', 'success'];
    const rand = Math.floor(Math.random() * arr.length);
    const item = arr[rand];

    switch (item) {
      case 'error':
        jokerContext.showError(`This is an error message ${Date.now()}`);
        break;
      case 'info':
        jokerContext.showInfo(
          `This is an info message, lorem ipsum dolor sit amet consectetur, Curabitur et rhoncus lorem, eu congue lorem. Curabitur molestie, mi sit amet sodales rhoncus, urna libero commodo mi, et imperdiet metus sapien non leo. Praesent facilisis vulputate neque, id consectetur urna gravida et. ${Date.now()}`
        );
        break;
      case 'success':
        jokerContext.showSuccess(`This is a success message ${Date.now()}`);
        break;
    }
  };

  useEffect(() => {
    if (jokerContext.alerts.length && !currentAlert) {
      const newAlert = jokerContext.popAlert();
      if (!newAlert) {
        return;
      }
      setCurrentAlert(newAlert);
    }
  }, [jokerContext.alerts, currentAlert]);

  return (
    <View
      style={[
        styles.container,
        {
          height: currentAlert ? '100%' : 'auto',
          backgroundColor: 'rgba(0, 0, 0, .5)',
        },
      ]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.joker, animatedStyle]}>
          <JokerIcon width={JOKER_SIZE} height={JOKER_SIZE} />
        </Animated.View>
      </GestureDetector>

      {currentAlert && (
        <JokerDialogue currentAlert={currentAlert} setCurrentAlert={setCurrentAlert} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  joker: {
    position: 'absolute',
    top: TOP_OFFSET,
  },
});

export default Joker;
