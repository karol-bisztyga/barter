import { JokerIcon } from '../utils/icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { useJokerContext } from '../context/JokerContext';

const JOKER_SIZE = 50;

const Joker = () => {
  const jokerContext = useJokerContext();

  const pressJoker = () => {
    console.log('press joker');
    const arr = ['error', 'info', 'success'];
    const rand = Math.floor(Math.random() * arr.length);
    const item = arr[rand];

    switch (item) {
      case 'error':
        jokerContext.showError('This is an error message');
        break;
      case 'info':
        jokerContext.showInfo('This is an info message');
        break;
      case 'success':
        jokerContext.showSuccess('This is a success message');
        break;
    }
  };

  useEffect(() => {
    console.log('alerts currently', jokerContext.alerts);
  }, [jokerContext.alerts]);

  return (
    <TouchableOpacity
      style={[
        styles.joker,
        {
          top: Constants.statusBarHeight + 4,
        },
      ]}
      onPress={pressJoker}
    >
      <JokerIcon width={JOKER_SIZE} height={JOKER_SIZE} />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  joker: {
    position: 'absolute',
    right: 20,
  },
});

export default Joker;
