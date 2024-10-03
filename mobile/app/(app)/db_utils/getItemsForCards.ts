import { SessionContextState } from '../../SessionContext';
import { ItemData } from '../types';
import { cityNameFromLocation } from '../utils/reusableStuff';
import { executeProtectedQuery } from './executeProtectedQuery';

// todo we need to send the card ids we already have and exclude them because now we re-pull the same cards (they're not like yet but they're in the local 'stack')
export const getItemsForCards = async (
  sessionContext: SessionContextState,
  currentCardsIds: string[],
  limit: number = 5,
  userLocation?: string
) => {
  const userCityName = await cityNameFromLocation(userLocation);

  const response = await executeProtectedQuery(
    sessionContext,
    'cards',
    'GET',
    { limit: limit.toString(), currentCardsIds: JSON.stringify(currentCardsIds), userCityName },
    null
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
