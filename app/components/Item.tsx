import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Carousel from './Carousel';
import { Card, ItemBorderRadius } from '../types';

const { height } = Dimensions.get('window');

export default function Item({
  card,
  showDescription = true,
  showName = true,
  borderRadius = ItemBorderRadius['up-only'],
  carouselDotsVisible = true,
  carouselPressEnabled = true,
  showFull = false,
  centerVertically = true,
  onPress,
}: {
  card: Card;
  showDescription?: boolean;
  showName?: boolean;
  borderRadius?: ItemBorderRadius;
  carouselDotsVisible?: boolean;
  carouselPressEnabled?: boolean;
  showFull?: boolean;
  centerVertically?: boolean;
  onPress?: () => void;
}) {
  const InnerContents = () => (
    <>
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
          images={card.images}
          borderRadius={borderRadius}
          dotsVisible={carouselDotsVisible}
          pressEnabled={carouselPressEnabled}
          onPress={onPress}
        />
      </View>
      {showName && (
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{card.name}</Text>
        </View>
      )}
      {showDescription && (
        <View style={styles.descriptionWrapper}>
          <Text style={styles.description} numberOfLines={showFull ? 0 : 2}>
            {card.description}
          </Text>
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
  imageWrapper: {
    width: '100%',
    height: '75%',
  },
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
