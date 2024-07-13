import React from 'react';
import { View, StyleSheet, Text, Dimensions, Button } from 'react-native';
import { generateItem } from '../../mocks/itemsMocker';
import Item from '../../components/Item';
import { router } from 'expo-router';
import { Card, ItemBorderRadius } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';

const { width } = Dimensions.get('window');

const MatchModal = () => {
  const usersItem: Card = generateItem();
  const itemsContext = useItemsContext();

  const othersItem = itemsContext.othersItem;
  if (!othersItem) {
    router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.matchedLabel}>Items matched!</Text>
      <View style={[styles.itemsWrapper, { height: width }]}>
        <View style={styles.usersItem}>
          <Item
            card={usersItem}
            borderRadius={ItemBorderRadius.all}
            carouselActive={false}
            showDescription={false}
          />
        </View>
        <View style={styles.matchedItem}>
          <Item
            card={othersItem}
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
  usersItem: {
    flex: 1,
  },
  matchedItem: {
    backgroundColor: 'red',
    flex: 1,
  },
  matchedLabel: {
    fontSize: 50,
  },
});

export default MatchModal;
