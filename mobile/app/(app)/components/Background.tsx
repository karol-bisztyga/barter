import React from 'react';
import { useAssets } from 'expo-asset';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { hexToRgbaString } from '../utils/harmonicColors';
import { BROWN_COLOR_1, GOLD_COLOR_1 } from '../constants';

export type BackgroundTile = 'main' | 'paper';

type BackgroundConfig = {
  assetIndex: number;
  backgroundColor: string;
  imageOpacity: number;
};

type BackgroundProps = {
  tile: BackgroundTile;
  style?: object;
  forceFullScreen?: boolean;
};

const { height } = Dimensions.get('window');

const Background = ({ tile, style = {}, forceFullScreen }: BackgroundProps) => {
  const [assets, error] = useAssets([
    require('../../../assets/backgrounds/main_background.jpg'),
    require('../../../assets/backgrounds/paper.jpg'),
  ]);

  const getConfigForTile = (backgroundTile: BackgroundTile): BackgroundConfig | null => {
    switch (backgroundTile) {
      case 'main':
        return {
          assetIndex: 0,
          backgroundColor: hexToRgbaString(BROWN_COLOR_1, 0.7),
          imageOpacity: 0.1,
        };
      case 'paper':
        return {
          assetIndex: 1,
          backgroundColor: hexToRgbaString(GOLD_COLOR_1, 0.3),
          imageOpacity: 0.8,
        };
      default:
        console.error(`Invalid background tile: ${backgroundTile}`);
    }
    return null;
  };

  if (error) {
    console.error(`Error loading assets ${error}`);
  }
  if (!assets || !assets.length || error) {
    return null;
  }

  const config: BackgroundConfig | null = getConfigForTile(tile);

  if (config === null) {
    return null;
  }

  const { assetIndex, backgroundColor, imageOpacity } = config;

  return (
    <View style={[styles.wrapper, { height: forceFullScreen ? height : '100%', backgroundColor }]}>
      <ImageBackground
        source={{ uri: assets[assetIndex].uri }}
        style={[styles.background, { opacity: imageOpacity }, styles.mainBackground, style]}
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
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mainBackground: {
    width: 1920,
    height: 1080,
    top: 0,
    left: 0,
  },
  imageStyle: {},
});

export default Background;
