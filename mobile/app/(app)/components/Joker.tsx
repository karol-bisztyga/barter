import { Joker2Icon } from '../utils/icons';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { JokerAlert, useJokerContext } from '../context/JokerContext';
import { DIALOGUE_STATE, JokerDialogue } from './JokerDialogue';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSettingsContext } from '../context/SettingsContext';
import { GOLD_COLOR_1, GOLD_COLOR_4 } from '../constants';

const { width } = Dimensions.get('window');

const JOKER_SIZE = 52;
const TOP_OFFSET = Constants.statusBarHeight + 4;
const HORIZONTAL_OFFSET = 50;
const FORCE_LEFT_OR_RIGHT_POSITION = false;
const MESSAGE_DISAPPEAR_TIMEOUT = 1000;

const Joker = () => {
  const jokerContext = useJokerContext();
  const settingsContext = useSettingsContext();

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

  // state for dialogue begin
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<DIALOGUE_STATE>(DIALOGUE_STATE.IDLE);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [displayedText, setDisplayedText] = useState('');

  const fullText = currentMessage?.message || '';
  const typingDelay = 0;

  useEffect(() => {
    if (!currentMessage) {
      setDisplayedText('');
      return;
    }
    let index = 0;

    setState(DIALOGUE_STATE.TYPING);

    const newIntervalId = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[index]);
      index += 1;

      if (index >= fullText.length) {
        clearInterval(newIntervalId);
      }
    }, typingDelay);

    setIntervalId(newIntervalId);

    return () => clearInterval(newIntervalId);
  }, [fullText]);

  useEffect(() => {
    if (!currentMessage) {
      return;
    }
    if (displayedText === fullText) {
      if (state === DIALOGUE_STATE.TYPING) {
        setState(DIALOGUE_STATE.DISPLAYED);
      }
      if (!currentMessage?.blocking && state !== DIALOGUE_STATE.INTERRUPTED) {
        const newCloseTimeout = setTimeout(() => {
          if (currentMessage) {
            settingsContext.playSound('whooshHi');
            setCurrentMessage(null);
            setState(DIALOGUE_STATE.IDLE);
          }
        }, MESSAGE_DISAPPEAR_TIMEOUT);
        setCloseTimeout(newCloseTimeout);
      }
    }
  }, [displayedText]);

  const onPressDialogue = () => {
    settingsContext.playSound('whooshHi');
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    if (displayedText !== fullText) {
      setDisplayedText(fullText);
      setState(DIALOGUE_STATE.INTERRUPTED);
      if (intervalId) {
        clearInterval(intervalId);
      }
    } else {
      setState(DIALOGUE_STATE.IDLE);
      setCurrentMessage(null);
    }
  };
  // state for dialogue end

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
    settingsContext.playSound('click');

    jokerContext.showRandomGreeting();
    /*
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
    */
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
    <TouchableOpacity
      onPress={onPressDialogue}
      style={[
        styles.container,
        {
          height: currentMessage && currentMessage.blocking ? '100%' : 'auto',
          backgroundColor:
            currentMessage && currentMessage.blocking ? 'rgba(0, 0, 0, .5)' : 'transparent',
        },
      ]}
      activeOpacity={1}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.jokerWrapper, animatedStyle]}>
          <Joker2Icon width={JOKER_SIZE} height={JOKER_SIZE} style={styles.jokerIcon} />
        </Animated.View>
      </GestureDetector>

      {currentMessage && (
        <JokerDialogue onPressDialogue={onPressDialogue} displayedText={displayedText} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  jokerWrapper: {
    position: 'absolute',
    top: TOP_OFFSET,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: GOLD_COLOR_1,
    width: JOKER_SIZE,
    height: JOKER_SIZE,
    borderRadius: JOKER_SIZE / 2,

    shadowColor: GOLD_COLOR_4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  jokerIcon: {
    width: JOKER_SIZE,
    height: JOKER_SIZE,
    bottom: 11,
    left: -1,
  },
});

export default Joker;
