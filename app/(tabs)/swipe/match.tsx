import React from 'react';
import { View, StyleSheet, Text, Dimensions, Button } from 'react-native';
import { generateItem } from '../../mocks/itemsMocker';
import Item from '../../components/Item';
import { router, useLocalSearchParams } from 'expo-router';
import { Card, ItemBorderRadius } from '../../types';

const { width } = Dimensions.get('window');

const MatchModal = () => {
  const usersItem: Card = generateItem();

  const { matchedItemId, matchedItemName, matchedItemImages, matchedItemDescription } =
    useLocalSearchParams();
  const matchedItem: Card = {
    id: matchedItemId as string,
    name: matchedItemName as string,
    images: (matchedItemImages as string).split(','),
    description: matchedItemDescription as string,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.matchedLabel}>Items matched!</Text>
      <View style={[styles.itemsWrapper, { height: width }]}>
        <View style={styles.leftItem}>
          <Item
            card={usersItem}
            borderRadius={ItemBorderRadius.all}
            carouselActive={false}
            showDescription={false}
          />
        </View>
        <View style={styles.rightItem}>
          <Item
            card={matchedItem}
            borderRadius={ItemBorderRadius.all}
            carouselActive={false}
            showDescription={false}
          />
        </View>
      </View>
      <Button title="Cool!" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsWrapper: {
    flexDirection: 'row',
  },
  leftItem: {
    flex: 1,
  },
  rightItem: {
    flex: 1,
  },
  matchedLabel: {
    fontSize: 50,
  },
});

export default MatchModal;
