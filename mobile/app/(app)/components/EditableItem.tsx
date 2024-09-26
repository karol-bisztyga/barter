import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Carousel from './Carousel';
import { ItemData, ItemBorderRadius, ItemNamePlacement } from '../types';
import ButtonWrapper from '../genericComponents/ButtonWrapper';
import TextWrapper from '../genericComponents/TextWrapper';

const { height } = Dimensions.get('window');

export default function EditableItem({
  itemData,
  showDescription = true,
  showName = true,
  namePlacement = ItemNamePlacement['below'],
  borderRadius = ItemBorderRadius['up-only'],
  showFull = false,
  centerVertically = true,
  onPressMore = () => {},
  onPress,
}: {
  itemData: ItemData;
  showDescription?: boolean;
  showName?: boolean;
  namePlacement?: ItemNamePlacement;
  borderRadius?: ItemBorderRadius;
  showFull?: boolean;
  centerVertically?: boolean;
  onPressMore?: () => void;
  onPress?: () => void;
}) {
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
          dotsVisible={true}
          pressEnabled={true}
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
          <TextWrapper style={styles.description} numberOfLines={showFull ? 0 : 2}>
            {itemData.description}
          </TextWrapper>
          {!showFull && (
            <View style={{ padding: 10 }}>
              <ButtonWrapper title="more" onPress={onPressMore} />
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
