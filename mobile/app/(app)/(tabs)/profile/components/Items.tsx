import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ItemData, ItemBorderRadius, ItemNamePlacement } from '../../../types';
import Item from '../../../components/Item';
import EmptyItem from '../../../components/EmptyItem';
import { router } from 'expo-router';
import { MAX_ITEMS_SLOTS } from '../../../constants';
import { useItemsContext } from '../../../context/ItemsContext';
import { useUserContext } from '../../../context/UserContext';

const Items = () => {
  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  return (
    <View style={styles.container}>
      {userContext.items.map((item: ItemData, index: number) => {
        return (
          <View style={styles.itemWrapper} key={index}>
            <Item
              itemData={item}
              showDescription={false}
              carouselOptions={{
                dotsVisible: false,
              }}
              borderRadius={ItemBorderRadius.all}
              namePlacement={ItemNamePlacement.above}
              onPress={() => {
                itemsContext.setUsersItemId(item.id);
                router.push('profile/editItem');
              }}
            />
          </View>
        );
      })}
      {userContext.items.length < MAX_ITEMS_SLOTS && (
        <View style={styles.itemWrapper}>
          <EmptyItem
            borderRadius={ItemBorderRadius.all}
            namePlacement={ItemNamePlacement.above}
            onPress={() => {
              itemsContext.setUsersItemId(null);
              router.push('profile/editItem');
            }}
          />
        </View>
      )}
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
