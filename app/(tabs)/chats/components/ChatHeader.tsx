import React from 'react';
import { ItemBorderRadius } from '../../../types';
import { StyleSheet, View } from 'react-native';
import { useItemsContext } from '../../../context/ItemsContext';
import Item from '../../../components/Item';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

const ChatHeader = () => {
  const itemsContext = useItemsContext();
  const { usersItem, othersItem } = itemsContext;

  if (usersItem === null || othersItem === null) {
    throw new Error('at least one of the items has not been set');
  }

  return (
    <View style={styles.itemsWrapper}>
      <Item
        card={usersItem}
        carouselDotsVisible={false}
        showDescription={false}
        showName={false}
        borderRadius={ItemBorderRadius.all}
        onPress={() => {
          router.push({ pathname: 'chats/item', params: { whosItem: 'self' } });
        }}
      />
      <View style={styles.iconWrapper}>
        <FontAwesome size={28} name="refresh" style={styles.icon} />
      </View>
      <Item
        card={othersItem}
        carouselDotsVisible={false}
        showDescription={false}
        showName={false}
        borderRadius={ItemBorderRadius.all}
        onPress={() => {
          router.push({ pathname: 'chats/item', params: { whosItem: 'other' } });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemsWrapper: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 200,
    flexDirection: 'row',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  icon: {
    fontSize: 50,
  },
});

export default ChatHeader;
