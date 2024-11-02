import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ItemData } from '../../../types';
import { router } from 'expo-router';
import { MAX_ITEMS_SLOTS } from '../../../constants';
import { useItemsContext } from '../../../context/ItemsContext';
import { useUserContext } from '../../../context/UserContext';
import LinkItem from './items/LinkItem';
import Background from '../../../components/Background';

const MyItems = () => {
  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  return (
    <View style={styles.container}>
      <Background tile="stone" />
      {userContext.items.map((item: ItemData, index: number) => {
        return (
          <LinkItem
            key={index}
            id={`my-items-${index}`}
            isLast={false}
            name={item.name}
            onPress={() => {
              itemsContext.setUsersItemId(item.id);
              router.push('profile/editItem');
            }}
            imageUrl={item.images[0]}
          />
        );
      })}
      {userContext.items.length < MAX_ITEMS_SLOTS && (
        <LinkItem
          id="my-items-add-item"
          isLast={true}
          name="add new item"
          onPress={() => {
            itemsContext.setUsersItemId(null);
            router.push('profile/editItem');
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    marginRight: 16,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default MyItems;
