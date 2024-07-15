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
      <View style={[styles.itemsWrapper, { height: width, width: width }]}>
        <View style={[styles.itemsImagesWrapper, { height: width }]}>
          <View style={styles.usersItem}>
            <Item
              card={usersItem}
              borderRadius={ItemBorderRadius.all}
              carouselActive={false}
              showDescription={false}
              showName={false}
            />
          </View>
          <View style={styles.matchedItem}>
            <Item
              card={othersItem}
              borderRadius={ItemBorderRadius.all}
              carouselActive={false}
              showDescription={false}
              showName={false}
            />
          </View>
        </View>
        <View style={styles.itemsLabelsWrapper}>
          <View style={styles.usersItem}>
            <Text style={[styles.itemsLabel, { paddingRight: 10 }]}>{usersItem.name}</Text>
          </View>
          <View style={styles.matchedItem}>
            <Text style={[styles.itemsLabel, { paddingLeft: 10 }]}>{othersItem.name}</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', width: '100%', bottom: 50 }}>
          <Button title="Cool!" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  itemsWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  itemsImagesWrapper: {
    flex: 1,
    height: 200,
    flexDirection: 'row',
  },
  usersItem: {
    flex: 1,
  },
  matchedItem: {
    flex: 1,
  },
  itemsLabelsWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  itemsLabel: {
    fontSize: 30,
    textAlign: 'center',
  },
  matchedLabel: {
    fontSize: 50,
    textAlign: 'center',
  },
});

export default MatchModal;
