import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { Card } from '../../types';
import EditableItem from '../../components/EditableItem';

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

  return <EditableItem card={item} showFull={true} />;
};

export default ItemModal;
