import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

export default function Register() {
  return (
    <View style={styles.container}>
      <View style={styles.labelsWrapper}>
        <Text style={styles.label}>Registered successfully!</Text>
        <Text style={styles.label}>Please check your email for the verification code :)</Text>
      </View>
      <Button
        title="Proceed"
        onPress={() => {
          router.replace('/login');
        }}
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
  },
  labelsWrapper: {
    margin: 20,
  },
  label: {
    margin: 5,
    textAlign: 'center',
  },
});
