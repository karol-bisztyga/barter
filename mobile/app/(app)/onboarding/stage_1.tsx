import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text>Onboarding not implemented yet stage 1...</Text>
      <View style={styles.buttonWrapper}>
        <ButtonWrapper
          title="proceed"
          onPress={() => {
            router.navigate('/onboarding/stage_2');
          }}
        />
        <ButtonWrapper
          title="skip onboarding"
          onPress={() => {
            router.replace('/swipe');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
});
