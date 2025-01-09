import React from 'react';
import { View, StyleSheet } from 'react-native';
import Carousel from './Carousel';
import { ItemData } from '../types';
import { BookIcon } from '../utils/icons';
import { hexToRgbaString } from '../utils/harmonicColors';
import { BROWN_COLOR_3, GOLD_COLOR_1 } from '../constants';
import { IconButton } from '../genericComponents/IconButton';

type ItemProps = {
  cardHeight: number;
  itemData: ItemData;
  onPressMore?: () => void;
};

const DETAILS_ICON_SIZE = 24;

export default function CardItem({ itemData, onPressMore = () => {}, cardHeight }: ItemProps) {
  const InnerContents = () => (
    <View
      style={[
        styles.imageWrapper,
        {
          height: '100%',
        },
      ]}
    >
      <Carousel
        itemData={itemData}
        imageIndicatorsVisible={true}
        pressEnabled={true}
        actionPanelVisible={true}
      />
      <View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
          },
          styles.innerBorder,
        ]}
      />
      <IconButton
        Icon={BookIcon}
        style={{
          ...styles.detailsIconWrapper,
          // TODO this calculation is not perfect, but it's good enough for now
          bottom: cardHeight - (DETAILS_ICON_SIZE + 40),
        }}
        onPress={onPressMore}
      />
    </View>
  );
  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: 'center',
        },
      ]}
    >
      <InnerContents />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  innerBorder: {
    left: 0,
    top: 0,
    margin: 4,
    borderColor: GOLD_COLOR_1,
    borderWidth: 2,
    pointerEvents: 'none',
  },
  detailsIconWrapper: {
    position: 'absolute',
    right: 16,
    backgroundColor: hexToRgbaString(BROWN_COLOR_3, 0.65),
    borderWidth: 1,
    borderColor: GOLD_COLOR_1,
    borderRadius: 100,
    padding: 8,
  },
  imageWrapper: {},
  nameWrapper: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  descriptionWrapper: {
    margin: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 25,
    color: 'gray',
  },
});
