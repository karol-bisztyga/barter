import { ItemData } from '../types';
import { executeQuery } from './executeQuery';

export const updateItem = async (item: ItemData, imagesChanged: boolean, token: string) => {
  const response = await executeQuery(
    `items/${item.id}`,
    'PUT',
    null,
    {
      name: item.name,
      images: imagesChanged ? JSON.stringify(item.images) : '',
      description: item.description,
    },
    token
  );
  if (response.ok) {
    return { ...response.data, images: JSON.parse(response.data.images) };
  } else {
    throw new Error('update item error: ' + response.data.message);
  }
};
