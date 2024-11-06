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
import { useSoundContext } from '../context/SoundContext';

const { width } = Dimensions.get('window');

const JOKER_SIZE = 50;
const TOP_OFFSET = Constants.statusBarHeight + 4;
const HORIZONTAL_OFFSET = 50;
const FORCE_LEFT_OR_RIGHT_POSITION = false;

const Joker = () => {
  const jokerContext = useJokerContext();
  const soundContext = useSoundContext();

  const [currentMessage, setCurrentMessage] = useState<JokerAlert | null>(null);

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
      if (currentMessage) {
        return;
      }
      dragging.value = true;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      velocityX.value = event.velocityX;
    })
    .onEnd(() => {
      if (currentMessage) {
        return;
      }
      let finalX = clamp(
        positionX.value + translateX.value + velocityX.value * 0.2,
        horizontalBounds.left,
        horizontalBounds.right
      );
      finalX = FORCE_LEFT_OR_RIGHT_POSITION
        ? finalX < width / 2
          ? horizontalBounds.left
          : horizontalBounds.right
        : finalX;
      positionX.value = withSpring(finalX);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    })
    .onFinalize(() => {
      if (currentMessage) {
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
    if (currentMessage) {
      return;
    }
    soundContext.playSound('click');

    // TODO this function should do something different, probably say something like "hello I'm your assistant" etc
    const arr = ['error', 'info', 'success'];

    if (Math.floor(Math.random() * 2)) {
      jokerContext.showNonBlockingInfo(
        `Non blocking info! This is an info message, lorem ipsum ${Date.now()}`
      );
      return;
    }

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
    if (jokerContext.alerts.length && !currentMessage) {
      const newAlert = jokerContext.popAlert();
      if (!newAlert) {
        return;
      }
      setCurrentMessage(newAlert);
    }
  }, [jokerContext.alerts, currentMessage]);

  return (
    <View
      style={[
        styles.container,
        {
          height: currentMessage && currentMessage.blocking ? '100%' : 'auto',
          backgroundColor:
            currentMessage && currentMessage.blocking ? 'rgba(0, 0, 0, .5)' : 'transparent',
        },
      ]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.joker, animatedStyle]}>
          <JokerIcon width={JOKER_SIZE} height={JOKER_SIZE} />
        </Animated.View>
      </GestureDetector>

      {currentMessage && (
        <JokerDialogue currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} />
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
