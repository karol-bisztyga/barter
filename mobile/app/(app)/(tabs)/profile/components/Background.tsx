import React from 'react';
import { useAssets } from 'expo-asset';
import { ImageBackground, StyleSheet } from 'react-native';

const Background = ({ opacity = 0.5 }: { opacity?: number }) => {
  const [assets, error] = useAssets([require('../../../../../assets/backgrounds/stone.jpg')]);
  if (error) {
    console.error(`Error loading assets ${error}`);
  }
  if (!assets || !assets.length || error) {
    return null;
  }
  return (
    <ImageBackground
      source={{ uri: assets[0].uri }}
      style={styles.background}
      imageStyle={[styles.imageStyle, { opacity }]}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    resizeMode: 'repeat',
  },
});

export default Background;
