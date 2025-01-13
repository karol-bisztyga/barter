import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import TextWrapper from './(app)/genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import Background from './(app)/components/Background';

export default function Register() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <View style={styles.labelsWrapper}>
        <TextWrapper style={styles.label}>{t('register_successful_title')}</TextWrapper>
        <TextWrapper style={styles.label}>{t('register_successful_subtitle')}</TextWrapper>
      </View>
      <View style={styles.buttonsWrapper}>
        <ButtonWrapper
          title={t('proceed')}
          onPress={() => {
            router.replace('/login');
          }}
          mode="black"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  labelsWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonsWrapper: {
    flex: 1,
    margin: 12,
  },
  label: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
});
