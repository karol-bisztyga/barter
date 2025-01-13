import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';
import TextWrapper from '../genericComponents/TextWrapper';
import Background from '../components/Background';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetterOfEveryWord } from '../utils/reusableStuff';

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

  if (stage > MAX_STAGE) {
    return null;
  }

  const getFontSizeForStage = () => {
    if (stage === 1) {
      return 32;
    }
    if (stage === MAX_STAGE) {
      return 32;
    }
    return 24;
  };

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <TextWrapper
        style={[
          styles.content,
          {
            fontSize: getFontSizeForStage(),
          },
        ]}
      >
        {t('onboarding_stage_' + stage)}
      </TextWrapper>
      {/* TODO add descriptive images for certain stages */}
      <View style={styles.buttonsWrapper}>
        <ButtonWrapper
          title={capitalizeFirstLetterOfEveryWord(t('proceed'))}
          onPress={() => {
            setStage(stage + 1);
          }}
          mode="black"
        />
        <ButtonWrapper
          title={capitalizeFirstLetterOfEveryWord(t('onboarding_skip'))}
          onPress={() => {
            router.replace('/swipe');
          }}
          mode="red"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  content: {
    fontSize: 24,
    textAlign: 'center',
    margin: 20,
  },
  buttonsWrapper: {
    marginHorizontal: 20,
    gap: 8,
  },
});
