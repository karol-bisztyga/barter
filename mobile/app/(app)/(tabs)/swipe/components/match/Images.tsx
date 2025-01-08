import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { GoldGradient } from '../../../../genericComponents/GoldGradient';

const IMAGE_SIZE = 164;
const BORDER_SIZE = 2;

type ImagesProps = {
  leftImageUri: string;
  rightImageUri: string;
};

export const Images = ({ leftImageUri, rightImageUri }: ImagesProps) => {
  return (
    <View style={styles.container}>
      {/* Left Image */}
      <View style={styles.imageWrapper}>
        <GoldGradient />
        <Image source={{ uri: leftImageUri }} style={styles.image} />
      </View>

      {/* Right Image */}
      <View style={styles.imageWrapper}>
        <GoldGradient />
        <Image source={{ uri: rightImageUri }} style={styles.image} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    marginTop: 42,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
  },
  imageWrapper: {
    width: IMAGE_SIZE + BORDER_SIZE * 2,
    height: IMAGE_SIZE + BORDER_SIZE * 2,
  },
  image: {
    position: 'absolute',
    top: BORDER_SIZE,
    left: BORDER_SIZE,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    resizeMode: 'cover',
  },
});
