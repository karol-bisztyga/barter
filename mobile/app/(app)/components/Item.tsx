import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button } from 'react-native';
import Carousel from './Carousel';
import {
  ItemData,
  ItemBorderRadius,
  ItemNamePlacement,
  SwipeCallbacks,
  defaultSwipeCallbacks,
} from '../types';

const { height } = Dimensions.get('window');

type CarouselOptions = {
  dotsVisible?: boolean;
  pressEnabled?: boolean;
  actionPanelVisible?: boolean;
  swipeCallbacks?: SwipeCallbacks;
};

type ItemProps = {
  itemData: ItemData;
  showDescription?: boolean;
  showName?: boolean;
  namePlacement?: ItemNamePlacement;
  borderRadius?: ItemBorderRadius;
  showFull?: boolean;
  centerVertically?: boolean;
  carouselOptions?: CarouselOptions;
  onPressMore?: () => void;
  onPress?: () => void;
};

export default function Item({
  itemData,
  showDescription = true,
  showName = true,
  namePlacement = ItemNamePlacement['below'],
  borderRadius = ItemBorderRadius['up-only'],
  showFull = false,
  centerVertically = true,
  carouselOptions = {
    dotsVisible: true,
    pressEnabled: true,
    actionPanelVisible: false,
    swipeCallbacks: defaultSwipeCallbacks,
  },
  onPressMore = () => {},
  onPress,
}: ItemProps) {
  const InnerContents = () => (
    <>
      {showName && namePlacement === ItemNamePlacement.above && (
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{itemData.name}</Text>
        </View>
      )}
      <View
        style={[
          styles.imageWrapper,
          {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderRadius: borderRadius === ItemBorderRadius['all'] ? 20 : 0,
            height: showFull ? height / 2 : '75%',
          },
        ]}
      >
        <Carousel
          images={itemData.images}
          borderRadius={borderRadius}
          dotsVisible={carouselOptions.dotsVisible}
          pressEnabled={carouselOptions.pressEnabled}
          actionPanelVisible={carouselOptions.actionPanelVisible}
          itemOwnerLocation={itemData.userLocation}
          onPress={onPress}
        />
      </View>
      {showName && namePlacement === ItemNamePlacement.below && (
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{itemData.name}</Text>
        </View>
      )}
      {showDescription && (
        <View style={styles.descriptionWrapper}>
          <Text style={styles.description} numberOfLines={showFull ? 0 : 1} ellipsizeMode="tail">
            {itemData.description}
          </Text>
          {!showFull && (
            <View style={{ paddingTop: 20 }}>
              <Button title="more" onPress={onPressMore} />
            </View>
          )}
        </View>
      )}
    </>
  );
  if (showFull) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: centerVertically ? 'center' : 'flex-start',
          },
        ]}
      >
        <ScrollView>
          <InnerContents />
        </ScrollView>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: centerVertically ? 'center' : 'flex-start',
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
