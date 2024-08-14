import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const getUserMatches = async (sessionContext: SessionContextState) => {
  const response = await executeProtectedQuery(sessionContext, 'matches', 'GET', null, null);
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('get user matches error: ' + response.data.message);
  }
};
