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
    const responseData = { ...response.data };
    if (responseData.images) {
      responseData.images = JSON.parse(responseData.images);
    }
    return responseData;
  } else {
    throw new Error('update item error: ' + response.data.message);
  }
};
