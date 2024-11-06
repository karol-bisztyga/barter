import React from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import { BACKGROUND_COLOR } from './(app)/constants';
import TextWrapper from './(app)/genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import { SECTION_BACKGROUND } from './(app)/(tabs)/profile/components/items/editing_panels/constants';
import Background from './(app)/components/Background';

export default function Register() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Background tile="sword" />
      <View style={styles.labelsWrapper}>
        <TextWrapper style={styles.label}>{t('register_successful.title')}</TextWrapper>
        <TextWrapper style={styles.label}>{t('register_successful.subtitle')}</TextWrapper>
      </View>
      <ButtonWrapper
        title={t('proceed')}
        onPress={() => {
          router.replace('/login');
        }}
        fillColor={SECTION_BACKGROUND}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  labelsWrapper: {
    margin: 20,
  },
  label: {
    margin: 5,
    textAlign: 'center',
  },
});
