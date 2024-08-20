import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Item from '../../components/Item';
import { ItemData, ItemBorderRadius } from '../../types';
import { router } from 'expo-router';
import Separator, { SEPARATOR_HEIGHT } from '../../components/Separator';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { useMatchContext } from '../../context/MatchContext';

const ITEMS_PER_SCREEN = 4;

const ListItem = ({
  height,
  myItem,
  theirItem,
  registerRenderedListItem,
}: {
  height: number;
  myItem: ItemData;
  theirItem: ItemData;
  registerRenderedListItem: (_: string) => void;
}) => {
  return (
    <View
      style={[styles.itemsWrapper, { height }]}
      onLayout={() => {
        registerRenderedListItem(`${myItem.id}-${theirItem.id}`);
      }}
    >
      <View style={styles.itemWrapper}>
        <View style={styles.matchingItem}>
          <Item
            itemData={myItem}
            showName={false}
            showDescription={false}
            borderRadius={ItemBorderRadius.all}
            carouselOptions={{
              dotsVisible: false,
              pressEnabled: false,
            }}
          />
        </View>
        <View style={styles.iconWrapper}>
          <FontAwesome size={28} name="refresh" style={styles.icon} />
        </View>
        <View style={styles.matchedItem}>
          <Item
            itemData={theirItem}
            showName={false}
            showDescription={false}
            borderRadius={ItemBorderRadius.all}
            carouselOptions={{
              dotsVisible: false,
              pressEnabled: false,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default function Chats() {
  const itemsContext = useItemsContext();
  const userContext = useUserContext();
  const matchContext = useMatchContext();

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
        <ListItem
          height={listItemHeight}
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
        <FlatList
          style={{ opacity: listRendered ? 1 : 0 }}
          data={matchContext.matches}
          renderItem={({ item, index }) => {
            const { matchingItem, matchedItem, id } = item;
            // recognize which item is mine matching or matched and pass it properly to the list item
            const matchingItemFoundInUserItems =
              userContext.items.map((item) => item.id).indexOf(matchingItem.id) !== -1;
            const matchedItemFoundInUserItems =
              userContext.items.map((item) => item.id).indexOf(matchedItem.id) !== -1;
            if (matchingItemFoundInUserItems && matchedItemFoundInUserItems) {
              throw new Error(`both matching and matched item have been found in user's items`);
            }
            let myItem: ItemData;
            let theirItem: ItemData;
            if (matchingItemFoundInUserItems) {
              myItem = matchingItem;
              theirItem = matchedItem;
            } else if (matchedItemFoundInUserItems) {
              myItem = matchedItem;
              theirItem = matchingItem;
            } else {
              throw new Error(`neither matching nor matched item has been found in user's items`);
            }
            return (
              <>
                <TouchableOpacity
                  onPress={() => {
                    itemsContext.setUsersItemId(myItem.id);
                    itemsContext.setOthersItem(theirItem);
                    matchContext.setCurrentMatchId(id);
                    // pass match id to chat screen so we can use it in socket communication
                    router.push('chats/chat');
                  }}
                  activeOpacity={1}
                >
                  {renderListItem(myItem, theirItem)}
                </TouchableOpacity>
                {index < matchContext.matches.length - 1 && <Separator />}
              </>
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
});
