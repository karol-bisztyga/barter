import { Card } from '../types';
import { executeQuery } from './executeQuery';

export const getUserItems = async (userId: string, token: string) => {
  const response = await executeQuery('items', 'GET', { userId }, token);
  if (response.ok) {
    const data = response.data.map((dataItem: Card) => {
      return {
        ...dataItem,
        images: dataItem.images.map((image: string) => JSON.parse(image).url),
      };
    });
    return data;
  } else {
    throw new Error('get user items error: ' + response.data.message);
  }
};
