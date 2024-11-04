import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ItemBorderRadius, ItemData } from '../types';
import { useAssets } from 'expo-asset';
import CarouselDistancePanel from './CarouselDistancePanel';
import ImageWrapper from '../genericComponents/ImageWrapper';
import CarouselImageIndicators from './CarouselImageIndicators';
import CarouselInfoPanel from './CarouselInfoPanel';

const Carousel = ({
  itemData,
  borderRadius = ItemBorderRadius['up-only'],
  imageIndicatorsVisible = true,
  pressEnabled = true,
  actionPanelVisible = false,
  onPress,
  showInfo = true,
}: {
  itemData: ItemData;
  borderRadius?: ItemBorderRadius;
  imageIndicatorsVisible?: boolean;
  pressEnabled?: boolean;
  actionPanelVisible?: boolean;
  onPress?: () => void;
  showInfo?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState<number>(0);

  const [noImageAsset, error] = useAssets([require('../../../assets/no_img.jpg')]);

  if (error) {
    throw error;
  }

  const frontImageSource = itemData.images.length
    ? { uri: itemData.images[imageIndex] }
    : noImageAsset;

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
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderRadius: borderRadius === ItemBorderRadius['all'] ? 8 : 0,
          },
        ]}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />

      {itemData.images.length > 1 && imageIndicatorsVisible && (
        <CarouselImageIndicators
          images={itemData.images}
          actionPanelVisible={actionPanelVisible}
          imageIndex={imageIndex}
        />
      )}

      <TouchableOpacity
        disabled={!pressEnabled}
        style={styles.leftButton}
        onPress={() => {
          if (onPress) {
            onPress();
            return;
          }
          if (itemData.images.length <= 1) {
            return;
          }
          setLoading(true);
          setImageIndex(imageIndex === 0 ? itemData.images.length - 1 : imageIndex - 1);
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
          if (itemData.images.length <= 1) {
            return;
          }
          setLoading(true);
          setImageIndex(imageIndex >= itemData.images.length - 1 ? 0 : imageIndex + 1);
        }}
      />
      <CarouselDistancePanel itemData={itemData} />
      {showInfo && <CarouselInfoPanel itemData={itemData} />}
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
