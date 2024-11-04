import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ItemBorderRadius, ItemData, ItemNamePlacement } from '../../../types';
import { useItemsContext } from '../../../context/ItemsContext';
import Background from '../../../components/Background';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { useSoundContext } from '../../../context/SoundContext';
import Item from '../../../components/Item';

const Items = () => {
  const itemsContext = useItemsContext();
  const soundContext = useSoundContext();

  const items = itemsContext.usersItemsLikedByTargetItemOwner;

  return (
    <View style={styles.container}>
      <Background tile="sword" />
      {items.map((item: ItemData, index: number) => {
        const borderWidth = itemsContext.usersItemId === item.id ? 5 : 0;
        return (
          <TouchableOpacity
            style={[styles.itemWrapper, { borderWidth }]}
            key={index}
            activeOpacity={1}
            onPress={() => {
              soundContext.playSound('click');
              if (itemsContext.usersItemId === item.id) {
                return;
              }
              itemsContext.setUsersItemId(item.id);
            }}
          >
            <View style={styles.itemInnerWrapper}>
              <Item
                itemData={item}
                showDescription={false}
                carouselOptions={{
                  dotsVisible: false,
                  pressEnabled: false,
                }}
                borderRadius={ItemBorderRadius.all}
                namePlacement={ItemNamePlacement.above}
                showName={false}
              />
              <TextWrapper style={styles.labelName}>{item.name}</TextWrapper>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  itemWrapper: {
    height: 300,
    margin: 20,
    overflow: 'hidden',
    borderColor: 'green',
    borderRadius: 20,
  },
  itemInnerWrapper: {
    flex: 1,
    padding: 10,
  },
  labelName: {
    textAlign: 'center',
    fontSize: 20,
  },
});

export default Items;
