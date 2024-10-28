import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Carousel from './Carousel';
import { ItemData, ItemBorderRadius } from '../types';
import { BookIcon } from '../utils/icons';

type ItemProps = {
  itemData: ItemData;
  onPressMore?: () => void;
};

export default function CardItem({ itemData, onPressMore = () => {} }: ItemProps) {
  const InnerContents = () => (
    <View
      style={[
        styles.imageWrapper,
        {
          borderRadius: 8,
          height: '100%',
        },
      ]}
    >
      <Carousel
        itemData={itemData}
        borderRadius={ItemBorderRadius['all']}
        imageIndicatorsVisible={true}
        pressEnabled={true}
        actionPanelVisible={true}
      />
      <TouchableOpacity onPress={onPressMore}>
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255, 255, 255, .3)',
            borderRadius: 100,
            padding: 8,
          }}
        >
          <BookIcon width={30} height={30} color="white" />
        </View>
      </TouchableOpacity>
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
  container: {
    flex: 1,
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
