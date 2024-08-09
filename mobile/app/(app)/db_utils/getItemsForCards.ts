import { ItemData } from '../types';
import { executeQuery } from './executeQuery';

// todo we need to send the card ids we already have and exclude them because now we re-pull the same cards (they're not like yet but they're in the local 'stack')
export const getItemsForCards = async (
  token: string,
  currentCardsIds: string[],
  limit: number = 5
) => {
  const response = await executeQuery(
    'cards',
    'GET',
    { limit: limit.toString(), currentCardsIds: JSON.stringify(currentCardsIds) },
    null,
    token
  );
  if (response.ok) {
    const data = response.data.map((dataItem: ItemData) => {
      return {
        ...dataItem,
        images: dataItem.images,
      };
    });
    return data;
  } else {
    throw new Error('get items for cards error: ' + response.data.message);
  }
};
