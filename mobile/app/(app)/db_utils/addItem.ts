import { SessionContextState } from '../../SessionContext';
import { ItemData } from '../types';
import { executeProtectedQuery } from './executeProtectedQuery';

export const addItem = async (sessionContext: SessionContextState, item: ItemData) => {
  const response = await executeProtectedQuery(sessionContext, `items`, 'POST', null, {
    name: item.name,
    images: JSON.stringify(item.images),
    description: item.description,
  });
  if (response.ok) {
    return { ...response.data, images: JSON.parse(response.data.images) };
  } else {
    throw new Error('add item error: ' + response.data.message);
  }
};
