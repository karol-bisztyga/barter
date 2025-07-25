import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemData } from '../../types';
import { router, useFocusEffect } from 'expo-router';
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
import { capitalizeFirstLetterOfEveryWord } from '../../utils/reusableStuff';
import { PRESSABLE_ACTIVE_OPACITY } from '../../constants';
import Background from '../../components/Background';

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

  // This code runs every time the screen is navigated to
  useFocusEffect(
    useCallback(() => {
      matchContext.setCurrentMatchId(null);
    }, [])
  );

  useEffect(() => {
    if (listItemHeight && renderedListItems.length === matchContext.matches.length) {
      setListRendered(true);
    }
  }, [renderedListItems, listItemHeight]);

  const renderListItem = useCallback(
    (matchId: string, myItem: ItemData, theirItem: ItemData) => {
      return (
        <ChatItem
          id={matchId}
          myItem={myItem}
          theirItem={theirItem}
          registerRenderedListItem={registerRenderedListItem}
        />
      );
    },
    [listRendered]
  );

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
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
              <TextWrapper style={styles.noChatsLabel}>
                {capitalizeFirstLetterOfEveryWord(t('chats_no_chats'))}
              </TextWrapper>
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
                  const itemFromUserContext = userContext.findItemById(matchingItem.id);
                  if (!itemFromUserContext) {
                    throw new Error(`matching item not found in user's items`);
                  }
                  myItem = itemFromUserContext.item;
                  theirItem = matchedItem;
                } else if (matchedItemFoundInUserItems) {
                  const itemFromUserContext = userContext.findItemById(matchedItem.id);
                  if (!itemFromUserContext) {
                    throw new Error(`matched item not found in user's items`);
                  }
                  myItem = itemFromUserContext.item;
                  theirItem = matchingItem;
                } else {
                  throw new Error(
                    `neither matching nor matched item has been found in user's items`
                  );
                }
              } catch (e) {
                handleError(t, jokerContext, ErrorType.LOAD_MATCHES, `${e}`);
                return null;
              }
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (matchContext.currentMatchId) {
                      return;
                    }
                    settingsContext.playSound('click');
                    itemsContext.setUsersItemId(myItem.id);
                    itemsContext.setOthersItem(theirItem);
                    matchContext.setCurrentMatchId(id);
                    // pass match id to chat screen so we can use it in socket communication
                    router.push('chats/chat');
                  }}
                  activeOpacity={PRESSABLE_ACTIVE_OPACITY}
                >
                  {renderListItem(id, myItem, theirItem)}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
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
    fontSize: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.5,
  },
});
