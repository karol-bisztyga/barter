import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';
import TextWrapper from '../genericComponents/TextWrapper';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <TextWrapper>Onboarding not implemented yet stage 3...</TextWrapper>
      <ButtonWrapper
        title="proceed"
        onPress={() => {
          router.replace('/swipe');
        }}
      />
      <ButtonWrapper
        title="skip onboarding"
        onPress={() => {
          router.replace('/swipe');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
