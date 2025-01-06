import { Alert, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { useJokerContext } from '../context/JokerContext';
import TextWrapper from '../genericComponents/TextWrapper';
import * as Clipboard from 'expo-clipboard';
import { useSettingsContext } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { hexToRgbaString } from '../utils/harmonicColors';
import { useAssets } from 'expo-asset';
import { ErrorType, handleError } from '../utils/errorHandler';
import { TAB_BAR_BACKGROUND_COLOR } from '../constants';

const JOKER_SIZE = 50;
const TOP_OFFSET = Constants.statusBarHeight + 4;

export enum DIALOGUE_STATE {
  IDLE,
  TYPING,
  DISPLAYED,
  INTERRUPTED,
}

type JokerDialogueProps = {
  displayedText: string;
  onPressDialogue: () => void;
};

export const JokerDialogue = ({ displayedText, onPressDialogue }: JokerDialogueProps) => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();

  const [assets, error] = useAssets([require('../../../assets/backgrounds/paper3.jpg')]);

  const [backgroundImageLoaded, setBackgroundImageLoaded] = React.useState(false);

  const settingsContext = useSettingsContext();

  useEffect(() => {
    if (!error) {
      return;
    }
    handleError(
      t,
      jokerContext,
      ErrorType.INVALID_BACKGROUND_TILE,
      `Invalid background tile error: ${error}`
    );
  }, [error]);

  if (!assets || !assets.length || error) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { opacity: backgroundImageLoaded ? 1 : 0 }]}
      onPress={onPressDialogue}
      onLongPress={async () => {
        settingsContext.playSound('click');
        await Clipboard.setStringAsync(displayedText);
        Alert.alert(t('copied_to_clipboard'), displayedText);
      }}
      activeOpacity={1}
    >
      <ImageBackground
        source={{ uri: assets[0].uri }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageResizeStyle}
        onLoad={() => {
          setBackgroundImageLoaded(true);
        }}
      />
      <TextWrapper style={styles.textWrapper}>{displayedText}</TextWrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: TOP_OFFSET + JOKER_SIZE,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: hexToRgbaString('#AE875F', 1),
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  backgroundImageResizeStyle: {
    resizeMode: 'repeat',
  },
  textWrapper: {
    padding: 20,
    fontSize: 18,
    color: 'black',
    borderWidth: 2,
    borderRadius: 8,
    borderColor: TAB_BAR_BACKGROUND_COLOR,
  },
});
