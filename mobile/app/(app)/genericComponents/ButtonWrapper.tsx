import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MySvgImg from '../../../assets/wood.svg';

type MyButtonProps = {
  title: string;
  onPress: (() => void) | (() => Promise<void>);
  onLayout?: () => void;
  disabled?: boolean;
};

type Dimesions = {
  width: number;
  height: number;
};

const TILE_SIZE = 200;

const ButtonWrapper = ({ title, onPress, disabled, onLayout }: MyButtonProps) => {
  const [dimensions, setDimensions] = React.useState<Dimesions>({ width: 0, height: 0 });

  const Background = () => {
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

    if (!dimensions) {
      return null;
    }

    return (
      <View style={styles.backgroundWrapper}>
        {elements.map((row, i) => {
          return (
            <View key={`tile-${i}`} style={styles.backgroundRowWrapper}>
              {row.map((tile, j) => {
                return (
                  <MySvgImg
                    key={`tile-${i}-${j}`}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
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

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={[styles.container, { opacity: disabled ? 0.5 : 1 }]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
      }}
      disabled={disabled}
    >
      <Background />
      <Text style={styles.label}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
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
  label: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ButtonWrapper;
