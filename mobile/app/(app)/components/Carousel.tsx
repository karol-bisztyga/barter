import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ItemBorderRadius } from '../types';
import { useAssets } from 'expo-asset';
import CarouselActionPanel from './CarouselActionPanel';
import CarouselDots from './CarouselDots';
import CarouselDistancePanel from './CarouselDistancePanel';
import ImageWrapper from './ImageWrapper';

const Carousel = ({
  images,
  borderRadius = ItemBorderRadius['up-only'],
  dotsVisible = true,
  pressEnabled = true,
  actionPanelVisible = false,
  itemOwnerLocation = undefined,
  onPress,
}: {
  images: string[];
  borderRadius?: ItemBorderRadius;
  dotsVisible?: boolean;
  pressEnabled?: boolean;
  actionPanelVisible?: boolean;
  itemOwnerLocation?: string;
  onPress?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState<number>(0);

  const [noImageAsset, error] = useAssets([require('../../../assets/no_img.jpg')]);

  if (error) {
    throw error;
  }

  const frontImageSource = images.length ? { uri: images[imageIndex] } : noImageAsset;

  let imageUri = undefined;
  if (!Array.isArray(frontImageSource) && frontImageSource?.uri) {
    imageUri = frontImageSource.uri;
  }
  return (
    <View style={styles.container}>
      {/*
            here there was a problem with flickering indicator as the list get rerendered when it's modified
            so this can go on without indicator at least for now
        */}
      {/* {loading && (
          <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#0000ff" />
        )} */}
      <ImageWrapper
        uri={imageUri || ''}
        style={[
          styles.image,
          {
            opacity: loading ? 0 : 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderRadius: borderRadius === ItemBorderRadius['all'] ? 20 : 0,
          },
        ]}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />

      {images.length > 1 && dotsVisible && (
        <CarouselDots
          images={images}
          actionPanelVisible={actionPanelVisible}
          imageIndex={imageIndex}
        />
      )}

      <TouchableOpacity
        disabled={!pressEnabled}
        activeOpacity={1}
        style={styles.leftButton}
        onPress={() => {
          if (onPress) {
            onPress();
            return;
          }
          if (images.length <= 1) {
            return;
          }
          setLoading(true);
          setImageIndex(imageIndex === 0 ? images.length - 1 : imageIndex - 1);
        }}
      />

      <TouchableOpacity
        disabled={!pressEnabled}
        activeOpacity={1}
        style={styles.rightButton}
        onPress={() => {
          if (onPress) {
            onPress();
            return;
          }
          if (images.length <= 1) {
            return;
          }
          setLoading(true);
          setImageIndex(imageIndex >= images.length - 1 ? 0 : imageIndex + 1);
        }}
      />
      {actionPanelVisible && <CarouselActionPanel />}
      {itemOwnerLocation && <CarouselDistancePanel itemOwnerLocation={itemOwnerLocation} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    margin: 5,
  },
  leftButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
  },
  rightButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 20,
  },
  image: {
    flex: 1,
  },
});

export default Carousel;
