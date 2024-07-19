import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, ItemBorderRadius, ItemNamePlacement } from '../../../types';
import { generateItem, MAX_ITEMS_SLOTS } from '../../../mocks/itemsMocker';
import Item from '../../../components/Item';
import EmptyItem from '../../../components/EmptyItem';
import { router } from 'expo-router';
import { useItemsContext } from '../../../context/ItemsContext';

const Items = () => {
  const [items, setItems] = useState<Array<Card | null>>([]);
  const itemsContext = useItemsContext();

  useEffect(() => {
    const userItemsAmount = Math.floor(Math.random() * (MAX_ITEMS_SLOTS - 1) + 1);
    const loadedItems = items;
    for (let i = 0; i < MAX_ITEMS_SLOTS; ++i) {
      if (i >= userItemsAmount) {
        loadedItems[i] = null;
      } else {
        loadedItems[i] = generateItem();
      }
    }
    console.log(loadedItems);
    setItems(loadedItems);
  }, []);

  return (
    <View style={styles.container}>
      {items.map((item: Card | null, index: number) => {
        if (item === null) {
          return (
            <View key={index} style={styles.itemWrapper}>
              <EmptyItem
                borderRadius={ItemBorderRadius.all}
                namePlacement={ItemNamePlacement.above}
                onPress={() => {
                  console.log('add new item');
                }}
              />
            </View>
          );
        }
        return (
          <View style={styles.itemWrapper} key={index}>
            {item && (
              <Item
                card={item}
                showDescription={false}
                carouselDotsVisible={false}
                borderRadius={ItemBorderRadius.all}
                namePlacement={ItemNamePlacement.above}
                // carouselPressEnabled={false}
                onPress={() => {
                  console.log('details');

                  itemsContext.setUsersItem(item);
                  router.push({ pathname: 'profile/item', params: { whosItem: 'self' } });
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  itemWrapper: {
    height: 300,
    margin: 20,
  },
});

export default Items;
