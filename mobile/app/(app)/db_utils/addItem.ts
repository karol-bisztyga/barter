import { ItemData } from '../types';
import { executeQuery } from './executeQuery';

export const addItem = async (item: ItemData, token: string) => {
  const response = await executeQuery(
    `items`,
    'POST',
    null,
    {
      name: item.name,
      images: JSON.stringify(item.images),
      description: item.description,
    },
    token
  );
  if (response.ok) {
    return { ...response.data, images: JSON.parse(response.data.images) };
  } else {
    throw new Error('create item error: ' + response.data.message);
  }
};
