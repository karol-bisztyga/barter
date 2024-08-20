import React from 'react';
import { ItemBorderRadius } from '../../../types';
import { StyleSheet, View } from 'react-native';
import Item from '../../../components/Item';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useUserContext } from '../../../context/UserContext';
import { useItemsContext } from '../../../context/ItemsContext';

const ChatHeader = () => {
  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const { usersItemId, othersItem } = itemsContext;

  const usersItem = userContext.findItemById(usersItemId);
  if (!usersItem || !othersItem) {
    console.log('>>> ERR', usersItemId, usersItem);
    return null;
    // throw new Error('at least one of the items has not been set');
  }

  return (
    <View style={styles.itemsWrapper}>
      <Item
        itemData={usersItem.item}
        carouselOptions={{ dotsVisible: false }}
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
        itemData={othersItem}
        carouselOptions={{ dotsVisible: false }}
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
    borderBottomWidth: 1,
    borderColor: 'gray',
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
