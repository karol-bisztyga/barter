import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Item from '../../components/Item';
import { generateChatItems } from '../../mocks/itemsMocker';
import { Card, ItemBorderRadius } from '../../types';
import { router } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import Separator, { SEPARATOR_HEIGHT } from '../../components/Separator';
import { useUserContext } from '../../context/UserContext';

const ITEMS_PER_SCREEN = 4;

const ListItem = ({
  height,
  usersItem,
  othersItem,
}: {
  height: number;
  usersItem: Card;
  othersItem: Card;
}) => {
  return (
    <View
      style={[
        styles.itemsWrapper,
        { height: (height - SEPARATOR_HEIGHT * ITEMS_PER_SCREEN) / ITEMS_PER_SCREEN },
      ]}
    >
      <View style={styles.itemWrapper}>
        <View style={styles.usersItem}>
          <Item
            card={usersItem}
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
            card={othersItem}
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
  const itemsContext = useItemsContext();
  const userContext = useUserContext();
  // todo maybe put this in a context so when an item is removed, the chats with this item will be removed
  const items: Array<[Card, Card]> = generateChatItems(10, userContext.items);

  const [containerHeight, setContainerHeight] = useState<number>(0);

  return (
    <SafeAreaView>
      <View
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContainerHeight(height);
        }}
      >
        <FlatList
          data={items}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  onPress={() => {
                    const [usersItem, othersItem] = item;
                    itemsContext.usersItemId = usersItem.id;
                    itemsContext.othersItem = othersItem;
                    router.push('chats/chat');
                  }}
                  activeOpacity={1}
                >
                  <ListItem height={containerHeight} usersItem={item[0]} othersItem={item[1]} />
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
    justifyContent: 'center',
    alignItems: 'center',
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
  usersItem: {
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
