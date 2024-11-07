import React from 'react';
import { useAssets } from 'expo-asset';
import { Dimensions, ImageBackground, StyleSheet } from 'react-native';

export type BackgroundTile = 'sword' | 'stone';

type BackgroundProps = {
  tile: BackgroundTile;
  opacity?: number;
  style?: object;
  forceFullScreen?: boolean;
};

const { height } = Dimensions.get('window');

const Background = ({ tile, style = {}, opacity = 0.2, forceFullScreen }: BackgroundProps) => {
  const [assets, error] = useAssets([
    require('../../../assets/backgrounds/sword_small_500.jpg'),
    require('../../../assets/backgrounds/stone.jpg'),
  ]);

  const getAssetIndexForBackgroundTile = (backgroundTile: BackgroundTile) => {
    switch (backgroundTile) {
      case 'sword':
        return 0;
      case 'stone':
        return 1;
      default:
        // might as well not throw here and just don't render the background
        // handleError(
        //   t,
        //   jokerContext,
        //   ErrorType.INVALID_BACKGROUND_TILE,
        //   `Invalid background tile ${backgroundTile}`
        // );
        // for now console.error is enough
        console.error(`Invalid background tile ${backgroundTile}`);
    }
  };

  if (error) {
    console.error(`Error loading assets ${error}`);
  }
  if (!assets || !assets.length || error) {
    return null;
  }

  const backgroundTileIndex = getAssetIndexForBackgroundTile(tile);

  if (backgroundTileIndex === undefined) {
    return null;
  }

  return (
    <ImageBackground
      source={{ uri: assets[backgroundTileIndex].uri }}
      style={[styles.background, { opacity, height: forceFullScreen ? height : '100%' }, style]}
      imageStyle={styles.imageStyle}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    width: '100%',
  },
  imageStyle: {
    resizeMode: 'repeat',
  },
});

export default Background;
