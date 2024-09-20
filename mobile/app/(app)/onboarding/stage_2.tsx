import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text>Onboarding not implemented yet stage 2...</Text>
      <Button
        title="proceed"
        onPress={() => {
          router.navigate('/onboarding/stage_3');
        }}
      />
      <Button
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
