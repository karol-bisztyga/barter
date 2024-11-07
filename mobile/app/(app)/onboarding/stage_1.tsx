import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';
import TextWrapper from '../genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';

export default function Onboarding() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TextWrapper>{t('onboarding.stage_1.title')}</TextWrapper>
      <ButtonWrapper
        title="proceed"
        onPress={() => {
          router.navigate('/onboarding/stage_2');
        }}
        fillColor="white"
      />
      <ButtonWrapper
        title="skip onboarding"
        onPress={() => {
          router.replace('/swipe');
        }}
        fillColor="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
});
