import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Item from '../../components/Item';
import { ItemData, ItemBorderRadius, MatchData } from '../../types';
import { router } from 'expo-router';
import Separator, { SEPARATOR_HEIGHT } from '../../components/Separator';
import { useItemsContext } from '../../context/ItemsContext';
import { getUserMatches } from '../../db_utils/getUserMatches';
import { authorizeUser } from '../../utils/reusableStuff';

const ITEMS_PER_SCREEN = 4;

const ListItem = ({
  height,
  matchingItem,
  matchedItem,
}: {
  height: number;
  matchingItem: ItemData;
  matchedItem: ItemData;
}) => {
  return (
    <View
      style={[
        styles.itemsWrapper,
        { height: (height - SEPARATOR_HEIGHT * ITEMS_PER_SCREEN) / ITEMS_PER_SCREEN },
      ]}
    >
      <View style={styles.itemWrapper}>
        <View style={styles.matchingItem}>
          <Item
            itemData={matchingItem}
            showName={false}
            showDescription={false}
            borderRadius={ItemBorderRadius.all}
            carouselDotsVisible={false}
            carouselPressEnabled={false}
          />
        </View>
        <View style={styles.iconWrapper}>
          <FontAwesome size={28} name="refresh" style={styles.icon} />
        </View>
        <View style={styles.matchedItem}>
          <Item
            itemData={matchedItem}
            showName={false}
            showDescription={false}
            borderRadius={ItemBorderRadius.all}
            carouselDotsVisible={false}
            carouselPressEnabled={false}
          />
        </View>
      </View>
    </View>
  );
};

export default function Chats() {
  const token = authorizeUser();

  const itemsContext = useItemsContext();

  // array of [matchin item, matched item]
  const [items, setItems] = useState<MatchData[]>([]);
  useEffect(() => {
    getUserMatches(token)
      .then((matches: MatchData[]) => {
        setItems(matches);
      })
      .catch((e) => {
        console.error('error loading matches', e);
      });
  }, []);

  const [containerHeight, setContainerHeight] = useState<number>(0);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.container}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContainerHeight(height);
        }}
      >
        <FlatList
          data={items}
          renderItem={({ item, index }) => {
            const { matchingItem, matchedItem } = item;
            return (
              <>
                <TouchableOpacity
                  onPress={() => {
                    itemsContext.setUsersItemId(matchingItem.id);
                    itemsContext.setOthersItem(matchedItem);
                    router.push('chats/chat');
                  }}
                  activeOpacity={1}
                >
                  <ListItem
                    height={containerHeight}
                    matchingItem={matchingItem}
                    matchedItem={matchedItem}
                  />
                </TouchableOpacity>
                {index < items.length - 1 && <Separator />}
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
});
