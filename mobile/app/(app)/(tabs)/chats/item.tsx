import React from 'react';
import Item from '../../components/Item';
import { router, useLocalSearchParams } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { ItemData } from '../../types';
import { useUserContext } from '../../context/UserContext';

const ItemScreen = () => {
  const itemsContext = useItemsContext();
  const userContext = useUserContext();
  const { whosItem } = useLocalSearchParams();

  let item: ItemData | null = null;
  if (whosItem === 'self') {
    item = userContext.findItemById(itemsContext.usersItemId)?.item || null;
  } else if (whosItem === 'other') {
    item = itemsContext.othersItem;
  }
  if (!item) {
    console.error('item has not been specified/set');
    router.back();
    return null;
  }

  return <Item itemData={item} showFull={true} />;
};

export default ItemScreen;
