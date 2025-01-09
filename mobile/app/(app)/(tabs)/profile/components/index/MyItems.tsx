import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ItemData } from '../../../../types';
import { router } from 'expo-router';
import { MAX_ITEMS_SLOTS, TAB_BAR_BACKGROUND_COLOR } from '../../../../constants';
import { useItemsContext } from '../../../../context/ItemsContext';
import { useUserContext } from '../../../../context/UserContext';
import LinkItem from '../items/LinkItem';
import { useTranslation } from 'react-i18next';

const MyItems = () => {
  const { t } = useTranslation();

  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  return (
    <View style={styles.container}>
      {userContext.items.map((item: ItemData, index: number) => {
        return (
          <LinkItem
            key={index}
            id={`my-items-${index}`}
            isLast={false}
            name={item.name}
            onPress={() => {
              itemsContext.setUsersItemId(item.id);
              router.push('profile/edit_item');
            }}
            imageUrl={item.images[0]}
            automaticallyCapitablizeFirstLetters={false}
          />
        );
      })}
      {userContext.items.length < MAX_ITEMS_SLOTS && (
        <LinkItem
          id="my-items-add-item"
          isLast={true}
          name={t('profile_add_new_item')}
          onPress={() => {
            itemsContext.setUsersItemId(null);
            router.push('profile/edit_item');
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: TAB_BAR_BACKGROUND_COLOR,
    marginHorizontal: 20,
  },
});

export default MyItems;
