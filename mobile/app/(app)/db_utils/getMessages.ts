import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const getMessages = async (
  sessionContext: SessionContextState,
  matchId: string,
  offset: string,
  limit: string
) => {
  const response = await executeProtectedQuery(
    sessionContext,
    'messages',
    'GET',
    {
      matchId,
      offset,
      limit,
    },
    null
  );
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('get user items error: ' + response.data.message);
  }
};
