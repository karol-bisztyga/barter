import React from 'react';
import Item from '../../components/Item';
import { router, useLocalSearchParams } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { ItemData } from '../../types';
import { useUserContext } from '../../context/UserContext';
import { ErrorType, handleError } from '../../utils/errorHandler';
import { useJokerContext } from '../../context/JokerContext';
import Background from '../../components/Background';
import { useTranslation } from 'react-i18next';

const ItemModal = () => {
  const { t } = useTranslation();

  const itemsContext = useItemsContext();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const { whosItem } = useLocalSearchParams();

  let item: ItemData | null = null;
  if (whosItem === 'self') {
    item = userContext.findItemById(itemsContext.usersItemId)?.item || null;
  } else if (whosItem === 'other') {
    item = itemsContext.othersItem;
  }
  if (!item) {
    handleError(t, jokerContext, ErrorType.ITEM_UNKNOWN, `item has not been specified/set`);
    router.back();
    return null;
  }

  return (
    <>
      <Background tile="main" forceFullScreen />
      <Item itemData={item} showFull={true} showDescription={false} showName={false} />
    </>
  );
};

export default ItemModal;
