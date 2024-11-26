import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import React from 'react';
import { JokerAlert } from '../context/JokerContext';
import TextWrapper from '../genericComponents/TextWrapper';
import * as Clipboard from 'expo-clipboard';
import { useSettingsContext } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { generateHarmonicColor, TargetColor } from '../utils/harmonicColors';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../constants';

const JOKER_SIZE = 50;
const TOP_OFFSET = Constants.statusBarHeight + 4;

export enum DIALOGUE_STATE {
  IDLE,
  TYPING,
  DISPLAYED,
  INTERRUPTED,
}

type JokerDialogueProps = {
  currentMessage: JokerAlert;
  displayedText: string;
  onPressDialogue: () => void;
};

export const JokerDialogue = ({
  currentMessage,
  displayedText,
  onPressDialogue,
}: JokerDialogueProps) => {
  const { t } = useTranslation();

  const settingsContext = useSettingsContext();

  const getBackgroundColor = () => {
    switch (currentMessage.type) {
      case 'error':
        return generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.RED);
      case 'info':
        return generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.BLUE);
      case 'success':
        return generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.GREEN);
      default:
        return 'white';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPressDialogue}
      onLongPress={async () => {
        settingsContext.playSound('click');
        await Clipboard.setStringAsync(displayedText);
        Alert.alert(t('copied_to_clipboard'), displayedText);
      }}
      activeOpacity={1}
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
    color: 'white',
  },
});
