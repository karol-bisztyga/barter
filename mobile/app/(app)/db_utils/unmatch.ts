import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const unmatch = async (sessionContext: SessionContextState, matchId: string) => {
  const response = await executeProtectedQuery(sessionContext, `matches`, 'DELETE', null, {
    matchId,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('remove item error: ' + response.data.message);
  }
};
