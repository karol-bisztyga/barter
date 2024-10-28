import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';
import TextWrapper from '../genericComponents/TextWrapper';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <TextWrapper>Onboarding not implemented yet stage 2...</TextWrapper>
      <ButtonWrapper
        title="proceed"
        onPress={() => {
          router.navigate('/onboarding/stage_3');
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
