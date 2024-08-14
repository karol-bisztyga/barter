import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const removeItem = async (sessionContext: SessionContextState, itemId: string) => {
  const response = await executeProtectedQuery(
    sessionContext,
    `items/${itemId}`,
    'DELETE',
    null,
    null
  );
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('delete item error: ' + response.data.message);
  }
};
