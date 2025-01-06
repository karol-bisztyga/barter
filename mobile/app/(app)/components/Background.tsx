import React from 'react';
import { useAssets } from 'expo-asset';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { hexToRgbaString } from '../utils/harmonicColors';

export type BackgroundTile = 'stone' | 'main';

type BackgroundProps = {
  tile: BackgroundTile;
  opacity?: number;
  style?: object;
  forceFullScreen?: boolean;
};

const { height } = Dimensions.get('window');

const Background = ({ tile, style = {}, opacity = 0.2, forceFullScreen }: BackgroundProps) => {
  const [assets, error] = useAssets([
    require('../../../assets/backgrounds/main_background.png'),
    require('../../../assets/backgrounds/stone.jpg'),
  ]);

  const getAssetIndexForBackgroundTile = (backgroundTile: BackgroundTile) => {
    switch (backgroundTile) {
      case 'main':
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
        console.error(`Invalid background tile: ${backgroundTile}`);
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

  if (tile === 'main') {
    opacity = 0.1;
  }

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={{ uri: assets[backgroundTileIndex].uri }}
        style={[
          styles.background,
          { opacity, height: forceFullScreen ? height : '100%' },
          styles.mainBackground,
          style,
        ]}
        imageStyle={styles.imageStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: hexToRgbaString('#41342A', 0.7),
  },
  background: {
    position: 'absolute',
  },
  mainBackground: {
    width: 4032,
    height: 2688,
    top: -45,
    left: -202,
  },
  imageStyle: {
    resizeMode: 'repeat',
  },
});

export default Background;
