import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MandolinIcon, SpearIcon, TrumpetIcon } from '../(app)/utils/icons';
import { useSettingsContext } from '../(app)/context/SettingsContext';
import { getIconForLanguage } from '../(app)/utils/reusableStuff';
import { BROWN_COLOR_2, GOLD_COLOR_1 } from '../(app)/constants';
import { LinearGradient } from 'expo-linear-gradient';

const ICON_WRAPPER_SIZE = 64;
const ICON_SIZE = 36;

const Gradient = () => {
  return (
    <LinearGradient
      colors={['#000', BROWN_COLOR_2, '#000']}
      locations={[0, 0.38, 1]}
      style={styles.gradient}
    />
  );
};

const Settings = () => {
  const settingsContext = useSettingsContext();

  const toggleMusic = () => {
    settingsContext.playSound('click');
    settingsContext.setMusicOn(!settingsContext.musicOn);
  };

  const toggleSound = () => {
    settingsContext.setSoundsOn(!settingsContext.soundsOn);
  };

  const toggleLanguage = () => {
    settingsContext.playSound('click');
    if (settingsContext.language === 'language_polish') {
      settingsContext.setLanguage('language_english');
    } else {
      settingsContext.setLanguage('language_polish');
    }
  };

  const LanguageIcon = getIconForLanguage(settingsContext.language);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconWrapper} onPress={toggleMusic}>
          <Gradient />
          <MandolinIcon
            style={[
              styles.icon,
              {
                opacity: settingsContext.musicOn ? 1 : 0.3,
              },
            ]}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
          {!settingsContext.musicOn && (
            <SpearIcon style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconWrapper} onPress={toggleSound}>
          <Gradient />
          <TrumpetIcon
            style={[
              styles.icon,
              {
                opacity: settingsContext.soundsOn ? 1 : 0.3,
              },
            ]}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
          {!settingsContext.soundsOn && (
            <SpearIcon style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
          )}
        </TouchableOpacity>
      </View>

      {LanguageIcon && (
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconWrapper} onPress={toggleLanguage}>
            <Gradient />
            <LanguageIcon style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 30,
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderWidth: 1,
    width: ICON_WRAPPER_SIZE,
    height: ICON_WRAPPER_SIZE,
    borderRadius: ICON_WRAPPER_SIZE,
    borderColor: GOLD_COLOR_1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    margin: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: ICON_WRAPPER_SIZE,
    opacity: 0.4,
  },
});

export default Settings;
