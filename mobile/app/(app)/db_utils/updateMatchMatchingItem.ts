import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const updateMatchMatchingItem = async (
  sessionContext: SessionContextState,
  newMatchingItemId: string,
  matchingItemId: string,
  matchedItemId: string
) => {
  const response = await executeProtectedQuery(sessionContext, `matches`, 'PUT', null, {
    newMatchingItemId,
    matchingItemId,
    matchedItemId,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('update matching item error: ' + response.data.message);
  }
};
