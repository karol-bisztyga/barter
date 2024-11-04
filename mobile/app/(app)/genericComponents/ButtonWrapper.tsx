import React, { useEffect, useState } from 'react';
import {
  ColorValue,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BACKGROUND_COLOR } from '../constants';
import { DimensionsType, generatePaths } from './utils';
import { useAssets } from 'expo-asset';
import Svg, { Path } from 'react-native-svg';
import { useJokerContext } from '../context/JokerContext';
import { useSoundContext } from '../context/SoundContext';

export const BUTTON_HEIGHT = 40;

type MyButtonProps = {
  title: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress: (() => void) | (() => Promise<void>);
  disabled?: boolean;
  color?: ColorValue;
  fillColor: string;
};

const ButtonWrapper = ({ title, icon, onPress, disabled, color, fillColor }: MyButtonProps) => {
  const jokerContext = useJokerContext();
  const soundContext = useSoundContext();

  const [dimensions, setDimensions] = useState<DimensionsType>({
    width: 0,
    height: 0,
  });
  const [paths, setPaths] = useState<string[]>([]);

  const [assets, error] = useAssets([require('../../../assets/backgrounds/wood.jpg')]);

  useEffect(() => {
    if (error) {
      jokerContext.showError(`Error loading assets ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (!dimensions || (!dimensions.height && !dimensions.width) || paths.length) {
      return;
    }
    setPaths(generatePaths(dimensions));
  }, [dimensions]);

  const textStyle = {
    color: color ? color : BACKGROUND_COLOR,
  };

  const borderRadius = Math.floor(Math.random() * 8 + 4);

  return (
    <View
      style={[styles.container, { borderRadius }]}
      onLayout={(e) => {
        setDimensions({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          soundContext.playSound('click');
          onPress();
        }}
        style={[
          styles.button,
          icon ? styles.buttonWithIcon : styles.buttonWithoutIcon,
          { opacity: disabled ? 0.5 : 1 },
        ]}
        disabled={disabled}
      >
        {assets && assets.length && (
          <ImageBackground
            source={{ uri: assets[0].uri }}
            style={styles.background}
            imageStyle={styles.imageStyle}
          >
            <Svg height="100%" width="100%" style={styles.svgOverlay}>
              {paths.map((path, index) => (
                <Path key={index} d={path} fill={fillColor} />
              ))}
            </Svg>
          </ImageBackground>
        )}
        <View style={styles.labelWrapper}>
          {icon && <FontAwesome size={30} name={icon} style={[styles.icon, textStyle]} />}
          <Text
            style={[styles.label, icon ? styles.labelWithIcon : styles.labelWithoutIcon, textStyle]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  button: {
    height: BUTTON_HEIGHT,
    overflow: 'hidden',
  },
  buttonWithIcon: {
    flexDirection: 'row',
  },
  buttonWithoutIcon: {},
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    resizeMode: 'repeat',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  labelWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  label: {
    fontFamily: 'Schoolbell',
    lineHeight: BUTTON_HEIGHT,
    height: BUTTON_HEIGHT,
    fontSize: 20,
  },
  labelWithoutIcon: {
    textAlign: 'center',
  },
  labelWithIcon: {
    margin: 5,
    marginLeft: 20,
  },
  icon: {
    width: 30,
    textAlign: 'center',
  },
});

export default ButtonWrapper;
