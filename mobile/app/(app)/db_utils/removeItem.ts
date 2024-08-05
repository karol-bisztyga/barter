import { executeQuery } from './executeQuery';

export const removeItem = async (itemId: string, token: string) => {
  const response = await executeQuery(`items/${itemId}`, 'DELETE', null, null, token);
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('delete item error: ' + response.data.message);
  }
};
