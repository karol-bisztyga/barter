import React from 'react';
import { ItemBorderRadius } from '../../../types';
import { StyleSheet, View } from 'react-native';
import Item from '../../../components/Item';
import { router } from 'expo-router';
import { useUserContext } from '../../../context/UserContext';
import { useItemsContext } from '../../../context/ItemsContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import { ArrowsIcon } from '../../../utils/icons';

const ChatHeader = () => {
  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const { usersItemId, othersItem } = itemsContext;

  const usersItem = userContext.findItemById(usersItemId);
  if (!usersItem || !othersItem) {
    // todo replace all occurences of 'your session seems to be corrupted' with a function or sth
    handleError(
      ErrorType.CORRUPTED_SESSION,
      `your session seems to be corrupted (data for one of the items is not present), you may want to restart the app or log in again`
    );
    return null;
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
        <ArrowsIcon width={28} height={28} />
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
});

export default ChatHeader;
