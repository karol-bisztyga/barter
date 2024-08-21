import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const addLike = async (
  sessionContext: SessionContextState,
  likedItemId: string,
  decision: boolean
) => {
  const response = await executeProtectedQuery(sessionContext, `likes`, 'POST', null, {
    likedItemId,
    decision: decision.toString(),
  });
  if (response.ok) {
    // here we should return whether a match was made or not
    // of there's a match, the user will see the screen to choose an item for this match
    return response.data;
  } else {
    throw new Error('add like error: ' + response.data.message);
  }
};
