import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';
import TextWrapper from '../genericComponents/TextWrapper';
import Background from '../components/Background';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const MAX_STAGE = 9;

export default function Onboarding() {
  useAuth();

  const { t } = useTranslation();
  const [stage, setStage] = useState(1);

  useEffect(() => {
    if (stage > MAX_STAGE) {
      router.replace('/swipe');
    }
  }, [stage]);

  return (
    <View style={styles.container}>
      <Background tile="sword" />
      <TextWrapper style={styles.content}>{t('onboarding_stage_' + stage)}</TextWrapper>
      {/* TODO add descriptive images for certain stages */}
      <ButtonWrapper
        title={t('proceed')}
        onPress={() => {
          setStage(stage + 1);
        }}
        fillColor="white"
      />
      <ButtonWrapper
        title={t('onboarding_skip')}
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
  content: {
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 8,
  },
});
