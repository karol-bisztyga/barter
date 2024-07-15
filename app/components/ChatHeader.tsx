import React from 'react';
import { ItemBorderRadius } from '../types';
import { StyleSheet, View } from 'react-native';
import { useItemsContext } from '../context/ItemsContext';
import Item from './Item';

const ChatHeader = () => {
  const itemsContext = useItemsContext();
  const { usersItem, othersItem } = itemsContext;

  if (usersItem === null || othersItem === null) {
    throw new Error('at least one of the items has not been set');
  }

  return (
    <View style={styles.itemsWrapper}>
      <View style={styles.itemWrapper}>
        <View style={styles.usersItem}>
          <Item
            card={usersItem}
            onPress={() => {
              console.log('open item modal');
            }}
            showDescription={false}
            carouselActive={false}
            showName={false}
            borderRadius={ItemBorderRadius.all}
          />
        </View>
        <View style={styles.othersItem}>
          <Item
            card={othersItem}
            onPress={() => {
              console.log('open item modal');
            }}
            showDescription={false}
            carouselActive={false}
            showName={false}
            borderRadius={ItemBorderRadius.all}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemsWrapper: {
    paddingLeft: 20,
    paddingRight: 20,
    height: 200,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  usersItem: {
    flex: 1,
  },
  othersItem: {
    flex: 1,
  },
});

export default ChatHeader;
