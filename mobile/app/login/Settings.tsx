import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MandolinIcon, SpearIcon, TrumpetIcon } from '../(app)/utils/icons';
import { useSettingsContext } from '../(app)/context/SettingsContext';
import { getIconForLanguage } from '../(app)/utils/reusableStuff';

const ICON_SIZE = 48;

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
      <TouchableOpacity style={styles.iconWrapper} onPress={toggleMusic}>
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

      <TouchableOpacity
        style={[
          styles.iconWrapper,
          {
            opacity: settingsContext.soundsOn ? 1 : 0.3,
          },
        ]}
        onPress={toggleSound}
      >
        <TrumpetIcon style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
        {!settingsContext.soundsOn && (
          <SpearIcon style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
        )}
      </TouchableOpacity>
      {LanguageIcon && (
        <TouchableOpacity style={styles.iconWrapper} onPress={toggleLanguage}>
          <LanguageIcon style={styles.icon} width={ICON_SIZE} height={ICON_SIZE} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  iconWrapper: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
  },
});

export default Settings;
