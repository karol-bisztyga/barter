import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { JokerAlert } from '../context/JokerContext';
import TextWrapper from '../genericComponents/TextWrapper';
import * as Clipboard from 'expo-clipboard';

const JOKER_SIZE = 50;
const TOP_OFFSET = Constants.statusBarHeight + 4;

type JokerDialogueProps = {
  currentAlert: JokerAlert;
  setCurrentAlert: (alert: JokerAlert | null) => void;
  typingDelay?: number;
};

export const JokerDialogue = ({
  currentAlert,
  setCurrentAlert,
  typingDelay = 0,
}: JokerDialogueProps) => {
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
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPressDialogue}
      onLongPress={async () => {
        await Clipboard.setStringAsync(displayedText);
        Alert.alert('Copied to Clipboard', displayedText);
      }}
    >
      <TextWrapper
        style={[
          styles.textWrapper,
          {
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        {displayedText}
      </TextWrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: TOP_OFFSET + JOKER_SIZE,
    margin: 8,
  },
  textWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    margin: 8,
    overflow: 'hidden',
    padding: 8,
    fontSize: 20,
  },
});
