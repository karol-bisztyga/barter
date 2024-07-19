import React from 'react';
import Item from '../../components/Item';
import { router, useLocalSearchParams } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { Card } from '../../types';

const ItemModal = () => {
  const itemsContext = useItemsContext();
  const { whosItem } = useLocalSearchParams();

  let item: Card | null = null;
  if (whosItem === 'self') {
    item = itemsContext.usersItem;
  } else if (whosItem === 'other') {
    item = itemsContext.othersItem;
  }
  if (!item) {
    console.error('item has not been specified/set');
    router.back();
    return null;
  }

  return <Item card={item} showFull={true} />;
};

export default ItemModal;
