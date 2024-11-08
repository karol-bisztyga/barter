import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemData } from '../../types';
import { router } from 'expo-router';
import { SEPARATOR_HEIGHT } from '../../components/Separator';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { useMatchContext } from '../../context/MatchContext';
import { ErrorType, handleError } from '../../utils/errorHandler';
import TextWrapper from '../../genericComponents/TextWrapper';
import ChatItem from './components/ChatItem';
import { useJokerContext } from '../../context/JokerContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_SCREEN = 4;

export default function Chats() {
  const { t } = useTranslation();

  const itemsContext = useItemsContext();
  const userContext = useUserContext();
  const matchContext = useMatchContext();
  const jokerContext = useJokerContext();
  const settingsContext = useSettingsContext();

  const [listItemHeight, setListItemHeight] = useState<number>(0);
  const [listRendered, setListRendered] = useState(false);
  const [renderedListItems, setRenderedListItems] = useState<string[]>([]);

  const registerRenderedListItem = (id: string) => {
    setRenderedListItems((previousValue) =>
      previousValue.indexOf(id) === -1 ? [...previousValue, id] : previousValue
    );
  };

  useEffect(() => {
    if (listItemHeight && renderedListItems.length === matchContext.matches.length) {
      setListRendered(true);
    }
  }, [renderedListItems, listItemHeight]);

  const renderListItem = useCallback(
    (myItem: ItemData, theirItem: ItemData) => {
      return (
        <ChatItem
          id={`${myItem.id}-${theirItem.id}`}
          myItem={myItem}
          theirItem={theirItem}
          registerRenderedListItem={registerRenderedListItem}
        />
      );
    },
    [listRendered]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.container}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setListItemHeight((height - SEPARATOR_HEIGHT * ITEMS_PER_SCREEN) / ITEMS_PER_SCREEN);
        }}
      >
        <View style={[styles.loader, { opacity: listRendered ? 0 : 1 }]}>
          <ActivityIndicator size="large" />
        </View>
        {matchContext.matches.length === 0 && listRendered && (
          <View style={styles.noChatsWrapper}>
            <TextWrapper style={styles.noChatsLabel}>{t('chats_no_chats')}</TextWrapper>
          </View>
        )}
        <FlatList
          style={{ opacity: listRendered ? 1 : 0 }}
          data={matchContext.matches}
          renderItem={({ item }) => {
            const { matchingItem, matchedItem, id } = item;
            // recognize which item is mine matching or matched and pass it properly to the list item
            const matchingItemFoundInUserItems =
              userContext.items.map((item) => item.id).indexOf(matchingItem.id) !== -1;
            const matchedItemFoundInUserItems =
              userContext.items.map((item) => item.id).indexOf(matchedItem.id) !== -1;
            let myItem: ItemData;
            let theirItem: ItemData;
            try {
              if (matchingItemFoundInUserItems && matchedItemFoundInUserItems) {
                throw new Error(`both matching and matched item have been found in user's items`);
              }
              if (matchingItemFoundInUserItems) {
                myItem = matchingItem;
                theirItem = matchedItem;
              } else if (matchedItemFoundInUserItems) {
                myItem = matchedItem;
                theirItem = matchingItem;
              } else {
                throw new Error(`neither matching nor matched item has been found in user's items`);
              }
            } catch (e) {
              handleError(t, jokerContext, ErrorType.LOAD_MATCHES, `${e}`);
              return null;
            }
            return (
              <TouchableOpacity
                onPress={() => {
                  settingsContext.playSound('click');
                  itemsContext.setUsersItemId(myItem.id);
                  itemsContext.setOthersItem(theirItem);
                  matchContext.setCurrentMatchId(id);
                  // pass match id to chat screen so we can use it in socket communication
                  router.push('chats/chat');
                }}
              >
                {renderListItem(myItem, theirItem)}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
  },
  itemsWrapper: {
    height: 100,
    padding: 10,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  matchingItem: {
    flex: 1,
  },
  iconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 50,
  },
  matchedItem: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsWrapper: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  noChatsLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.5,
  },
});
