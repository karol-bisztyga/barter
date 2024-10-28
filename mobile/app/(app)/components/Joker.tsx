import { JokerIcon } from '../utils/icons';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { JokerAlert, useJokerContext } from '../context/JokerContext';
import TextWrapper from '../genericComponents/TextWrapper';
import * as Clipboard from 'expo-clipboard';

const JOKER_SIZE = 50;
const TOP_OFFSET = Constants.statusBarHeight + 4;

type JokerDialogueProps = {
  currentAlert: JokerAlert;
  setCurrentAlert: (alert: JokerAlert | null) => void;
  typingDelay?: number;
};

const JokerDialogue = ({ currentAlert, setCurrentAlert, typingDelay = 0 }: JokerDialogueProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const fullText = currentAlert?.message;

  useEffect(() => {
    let index = 0;

    const newIntervalId = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[index]);
      index += 1;

      if (index >= fullText.length) {
        clearInterval(newIntervalId);
      }
    }, typingDelay);

    setIntervalId(newIntervalId);

    return () => clearInterval(newIntervalId);
  }, [fullText, typingDelay]);

  const onPressDialogue = () => {
    if (displayedText !== fullText) {
      setDisplayedText(fullText);
      if (intervalId) {
        clearInterval(intervalId);
      }
    } else {
      setCurrentAlert(null);
    }
  };

  const getBackgroundColor = () => {
    switch (currentAlert.type) {
      case 'error':
        return 'red';
      case 'info':
        return 'aqua';
      case 'success':
        return 'green';
      default:
        return 'white';
    }
  };

  return (
    <TouchableOpacity
      style={{
        top: TOP_OFFSET + JOKER_SIZE,
        margin: 8,
      }}
      activeOpacity={0.9}
      onPress={onPressDialogue}
      onLongPress={async () => {
        await Clipboard.setStringAsync(displayedText);
        Alert.alert('Copied to Clipboard', displayedText);
      }}
    >
      <TextWrapper
        style={{
          backgroundColor: getBackgroundColor(),
          borderWidth: 1,
          borderRadius: 10,
          margin: 8,
          overflow: 'hidden',
          padding: 8,
        }}
      >
        {displayedText}
      </TextWrapper>
    </TouchableOpacity>
  );
};

const Joker = () => {
  const jokerContext = useJokerContext();

  const [currentAlert, setCurrentAlert] = useState<JokerAlert | null>(null);

  const pressJoker = () => {
    console.log('press joker');
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
      <TouchableOpacity style={styles.joker} onPress={pressJoker}>
        <JokerIcon width={JOKER_SIZE} height={JOKER_SIZE} />
      </TouchableOpacity>

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
    right: 0,
  },
});

export default Joker;
