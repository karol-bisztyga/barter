import { ItemData } from '../types';
import { executeQuery } from './executeQuery';

export const getItemsForCards = async (token: string, limit: number = 5) => {
  const response = await executeQuery('cards', 'GET', { limit: limit.toString() }, null, token);
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
