import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Carousel from './Carousel';
import { ItemData, ItemBorderRadius } from '../types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
        images={itemData.images}
        borderRadius={ItemBorderRadius['all']}
        imageIndicatorsVisible={true}
        pressEnabled={true}
        actionPanelVisible={true}
        itemOwnerLocation={itemData.userLocation}
        infoPanelData={{
          itemName: itemData.name,
          itemOwnerName: itemData.userName,
          description: itemData.description,
        }}
      />
      <TouchableOpacity activeOpacity={1} onPress={onPressMore}>
        <FontAwesome
          size={30}
          name="info-circle"
          color="white"
          style={{
            position: 'absolute',
            bottom: 5,
            right: 10,
          }}
        />
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
