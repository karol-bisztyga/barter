import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Item from '../components/Item';
import { generateItem } from '../mocks/itemsMocker';
import { ItemBorderRadius } from '../types';

const SEPARATOR_HEIGHT = 1;
const ITEMS_PER_SCREEN = 4;

const ListItem = ({ height }: { height: number }) => {
  const usersItem = generateItem();
  const matchedItem = generateItem();

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
            carouselActive={false}
          />
        </View>
        <View style={styles.iconWrapper}>
          <FontAwesome size={28} name="refresh" style={styles.icon} />
        </View>
        <View style={styles.matchedItem}>
          <Item
            card={matchedItem}
            showName={false}
            showDescription={false}
            borderRadius={ItemBorderRadius.all}
            carouselActive={false}
          />
        </View>
      </View>
    </View>
  );
};

export default function Chats() {
  const items = new Array(10).fill(0);

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
            item; // suppress error
            return (
              <>
                <TouchableOpacity
                  onPress={() => {
                    console.log('go to chat');
                  }}
                  activeOpacity={1}
                >
                  <ListItem height={containerHeight} />
                </TouchableOpacity>
                {index < items.length - 1 && <View style={styles.separator} />}
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
  separator: {
    flex: 1,
    height: SEPARATOR_HEIGHT,
    backgroundColor: 'black',
    marginRight: 20,
    marginLeft: 20,
  },
});
