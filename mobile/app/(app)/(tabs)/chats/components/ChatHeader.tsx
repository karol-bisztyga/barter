import React from 'react';
import { ItemBorderRadius } from '../../../types';
import { StyleSheet, View } from 'react-native';
import Item from '../../../components/Item';
import { router } from 'expo-router';
import { useUserContext } from '../../../context/UserContext';
import { useItemsContext } from '../../../context/ItemsContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import { ArrowsIcon } from '../../../utils/icons';
import { useJokerContext } from '../../../context/JokerContext';
import { useSoundContext } from '../../../context/SoundContext';
import { useTranslation } from 'react-i18next';

const ChatHeader = () => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();
  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const soundContext = useSoundContext();

  const { usersItemId, othersItem } = itemsContext;

  const usersItem = userContext.findItemById(usersItemId);
  if (!usersItem || !othersItem) {
    handleError(t, jokerContext, ErrorType.CORRUPTED_SESSION);
    return null;
  }

  return (
    <View style={styles.itemsWrapper}>
      <View style={styles.imageWrapper}>
        <Item
          itemData={usersItem.item}
          carouselOptions={{ dotsVisible: false }}
          showDescription={false}
          showName={false}
          borderRadius={ItemBorderRadius.all}
          onPress={() => {
            soundContext.playSound('click');
            router.push({ pathname: 'chats/item', params: { whosItem: 'self' } });
          }}
        />
      </View>
      <View style={styles.iconWrapper}>
        <ArrowsIcon width={28} height={28} />
      </View>
      <View style={styles.imageWrapper}>
        <Item
          itemData={othersItem}
          carouselOptions={{ dotsVisible: false }}
          showDescription={false}
          showName={false}
          borderRadius={ItemBorderRadius.all}
          onPress={() => {
            soundContext.playSound('click');
            router.push({ pathname: 'chats/item', params: { whosItem: 'other' } });
          }}
        />
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  imageWrapper: {
    flex: 4,
    margin: 4,
    borderRadius: 16,
  },
  image: {
    flex: 1,
    borderRadius: 16,
  },
});

export default ChatHeader;
