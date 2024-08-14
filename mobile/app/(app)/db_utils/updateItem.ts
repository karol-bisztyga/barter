import { SessionContextState } from '../../SessionContext';
import { ItemData } from '../types';
import { executeProtectedQuery } from './executeProtectedQuery';

export const updateItem = async (
  sessionContext: SessionContextState,
  item: ItemData,
  imagesChanged: boolean
) => {
  const response = await executeProtectedQuery(sessionContext, `items/${item.id}`, 'PUT', null, {
    name: item.name,
    images: imagesChanged ? JSON.stringify(item.images) : '',
    description: item.description,
  });
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
