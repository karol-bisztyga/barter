import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const updateMatchNotified = async (
  sessionContext: SessionContextState,
  matchId: string,
  dateNotified: string
) => {
  const response = await executeProtectedQuery(sessionContext, `matches/notified`, 'PUT', null, {
    matchId,
    dateNotified,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('update matching item error: ' + response.data.message);
  }
};
