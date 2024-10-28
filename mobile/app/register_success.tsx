import React from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import ButtonWrapper from './(app)/genericComponents/ButtonWrapper';
import { BACKGROUND_COLOR } from './(app)/constants';
import TextWrapper from './(app)/genericComponents/TextWrapper';

export default function Register() {
  return (
    <View style={styles.container}>
      <View style={styles.labelsWrapper}>
        <TextWrapper style={styles.label}>Registered successfully!</TextWrapper>
        <TextWrapper style={styles.label}>
          Please check your email for the verification code :)
        </TextWrapper>
      </View>
      <ButtonWrapper
        title="Proceed"
        onPress={() => {
          router.replace('/login');
        }}
        fillColor="white"
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
