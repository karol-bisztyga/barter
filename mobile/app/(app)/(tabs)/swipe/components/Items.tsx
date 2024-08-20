import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ItemData, ItemBorderRadius, ItemNamePlacement } from '../../../types';
import Item from '../../../components/Item';
import { useItemsContext } from '../../../context/ItemsContext';

const Items = () => {
  const itemsContext = useItemsContext();

  const items = itemsContext.usersItemsLikedByTargetItemOwner;

  return (
    <View style={styles.container}>
      {items.map((item: ItemData, index: number) => {
        const borderWidth = itemsContext.usersItemId === item.id ? 5 : 0;
        return (
          <TouchableOpacity
            style={[styles.itemWrapper, { borderColor: 'green', borderRadius: 20, borderWidth }]}
            key={index}
            activeOpacity={1}
            onPress={() => {
              if (itemsContext.usersItemId === item.id) {
                return;
              }
              itemsContext.setUsersItemId(item.id);
              console.log('setting new current item id', itemsContext.usersItemId);
            }}
          >
            <Item
              itemData={item}
              showDescription={false}
              carouselOptions={{
                dotsVisible: false,
                pressEnabled: false,
              }}
              borderRadius={ItemBorderRadius.all}
              namePlacement={ItemNamePlacement.above}
            />
          </TouchableOpacity>
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
    padding: 10,
  },
});

export default Items;
