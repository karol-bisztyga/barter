import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Carousel from './Carousel';
import {
  ItemData,
  ItemBorderRadius,
  ItemNamePlacement,
  SwipeCallbacks,
  defaultSwipeCallbacks,
} from '../types';
import TextWrapper from '../genericComponents/TextWrapper';

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
  onPress,
}: ItemProps) {
  const InnerContents = () => (
    <>
      {showName && namePlacement === ItemNamePlacement.above && (
        <View style={styles.nameWrapper}>
          <TextWrapper style={styles.name}>{itemData.name}</TextWrapper>
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
          imageIndicatorsVisible={carouselOptions.dotsVisible}
          pressEnabled={carouselOptions.pressEnabled}
          actionPanelVisible={carouselOptions.actionPanelVisible}
          itemOwnerLocation={itemData.userLocation}
          onPress={onPress}
        />
      </View>
      {showName && namePlacement === ItemNamePlacement.below && (
        <View style={styles.nameWrapper}>
          <TextWrapper style={styles.name}>{itemData.name}</TextWrapper>
        </View>
      )}
      {showDescription && (
        <View style={styles.descriptionWrapper}>
          <TextWrapper
            style={styles.description}
            numberOfLines={showFull ? 0 : 1}
            ellipsizeMode="tail"
          >
            {itemData.description}
          </TextWrapper>
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
