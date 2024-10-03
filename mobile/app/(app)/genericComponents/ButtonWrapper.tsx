import React, { useEffect } from 'react';
import { ColorValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WoodSVG from '../../../assets/wood.svg';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FONT_COLOR, FONT_COLOR_DISABLED } from '../constants';

type MyButtonProps = {
  title: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress: (() => void) | (() => Promise<void>);
  onLayout?: () => void;
  disabled?: boolean;
  color?: ColorValue;
};

type ButtonWrapperDimensions = {
  width: number;
  height: number;
};

const TILE_SIZE = 200;

const Background = ({
  dimensions,
  onLayout,
}: {
  dimensions: ButtonWrapperDimensions;
  onLayout?: () => void;
}) => {
  const [elements, setElements] = React.useState<Array<Array<boolean>>>([]);

  useEffect(() => {
    if (!elements.length) {
      return;
    }
    for (const row of elements) {
      if (row.some((element) => !element)) {
        return;
      }
    }
    onLayout && onLayout();
  }, [elements]);

  useEffect(() => {
    if (!dimensions) {
      return;
    }
    const newElements: Array<Array<boolean>> = [];
    for (let i = 0; i < dimensions.height; i += TILE_SIZE) {
      const row: Array<boolean> = [];
      for (let j = 0; j < dimensions.width; j += TILE_SIZE) {
        row.push(false);
      }
      newElements.push(row);
    }
    setElements(newElements);
  }, [dimensions]);

  const [loadedFonts] = useFonts({
    Schoolbell: require('../../../assets/fonts/Schoolbell.ttf'),
  });

  if (!dimensions || !loadedFonts) {
    return null;
  }

  return (
    <View style={styles.backgroundWrapper}>
      {elements.map((row, i) => {
        return (
          <View key={`tile-${i}`} style={styles.backgroundRowWrapper}>
            {row.map((tile, j) => {
              return (
                <WoodSVG
                  key={`tile-${i}-${j}`}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  style={styles.backgroundTile}
                  onLayout={() => {
                    if (elements[i][j]) {
                      return;
                    }
                    const updatedElements = [...elements];
                    updatedElements[i][j] = true;
                    setElements(updatedElements);
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const ButtonWrapper = ({ title, icon, onPress, disabled, onLayout, color }: MyButtonProps) => {
  const [dimensions, setDimensions] = React.useState<ButtonWrapperDimensions>({
    width: 0,
    height: 0,
  });

  const textStyle = {
    color: color ? color : disabled ? FONT_COLOR_DISABLED : FONT_COLOR,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={[
          styles.button,
          icon ? styles.buttonWithIcon : styles.buttonWithoutIcon,
          { opacity: disabled ? 0.5 : 1 },
        ]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setDimensions({ width, height });
        }}
        disabled={disabled}
      >
        <Background dimensions={dimensions} onLayout={onLayout} />
        {icon && <FontAwesome size={30} name={icon} style={[styles.icon, textStyle]} />}
        <Text
          style={[styles.label, icon ? styles.labelWithIcon : styles.labelWithoutIcon, textStyle]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    margin: 5,
    padding: 10,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonWithoutIcon: {},
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'column',
    flex: 1,
  },
  backgroundRowWrapper: {
    flex: 1,
    width: TILE_SIZE,
    height: TILE_SIZE,
    flexDirection: 'row',
  },
  backgroundTile: {
    opacity: 0.8,
    shadowColor: 'black',
    shadowOpacity: 1,
  },
  label: {
    fontFamily: 'Schoolbell',
    lineHeight: 40,
    height: 40,
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
