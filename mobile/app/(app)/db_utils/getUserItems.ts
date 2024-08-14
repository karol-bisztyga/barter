import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const getUserItems = async (sessionContext: SessionContextState) => {
  const response = await executeProtectedQuery(sessionContext, 'items', 'GET', null, null);
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('get user items error: ' + response.data.message);
  }
};
