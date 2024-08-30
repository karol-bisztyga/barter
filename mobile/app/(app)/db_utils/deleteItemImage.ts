import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const deleteItemImage = async (
  sessionContext: SessionContextState,
  itemId: string,
  imageUrl: string
) => {
  const response = await executeProtectedQuery(sessionContext, `items/image`, 'DELETE', null, {
    itemId,
    imageUrl,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('upload profile picture: ' + response.data.message);
  }
};
