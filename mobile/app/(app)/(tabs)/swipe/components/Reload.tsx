import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CannonIcon } from '../../../utils/icons';
import Background from '../../../components/Background';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useTranslation } from 'react-i18next';

const ICON_SIZE = 200;

type ReloadProps = {
  onPress: () => void;
};

const Reload = ({ onPress }: ReloadProps) => {
  const { t } = useTranslation();

  const settingsContext = useSettingsContext();

  return (
    <View style={styles.container}>
      <Background tile="sword" forceFullScreen />
      <TextWrapper style={styles.label}>{t('reload')}</TextWrapper>
      <TouchableOpacity
        onPress={() => {
          settingsContext.playSound('click');
          onPress();
        }}
      >
        <CannonIcon width={ICON_SIZE} height={ICON_SIZE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  label: {
    width: '100%',
    height: 60,
    fontSize: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Reload;
