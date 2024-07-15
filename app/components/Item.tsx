import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Carousel from './Carousel';
import { Card, ItemBorderRadius } from '../types';

export default function Item({
  card,
  showDescription = true,
  showName = true,
  borderRadius = ItemBorderRadius['up-only'],
  carouselActive = true,
  onPress,
}: {
  card: Card;
  showDescription?: boolean;
  showName?: boolean;
  borderRadius?: ItemBorderRadius;
  carouselActive?: boolean;
  onPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderRadius: borderRadius === ItemBorderRadius['all'] ? 20 : 0,
          },
        ]}
      >
        <Carousel
          images={card.images}
          borderRadius={borderRadius}
          active={carouselActive}
          onPress={onPress}
        />
      </View>
      {showName && (
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{card.name}</Text>
        </View>
      )}
      {showDescription && (
        <ScrollView style={styles.descriptionWrapper}>
          <Text style={styles.description}>{card.description}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    color: 'gray',
  },
});
