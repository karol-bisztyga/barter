import { ItemData } from '../types';
import { executeQuery } from './executeQuery';

export const getUserItems = async (userId: string, token: string) => {
  const response = await executeQuery('items', 'GET', { userId }, null, token);
  if (response.ok) {
    const data = response.data.map((dataItem: ItemData) => {
      return {
        ...dataItem,
        images: dataItem.images,
      };
    });
    return data;
  } else {
    throw new Error('get user items error: ' + response.data.message);
  }
};
