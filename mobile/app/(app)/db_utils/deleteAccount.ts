import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const deleteAccount = async (sessionContext: SessionContextState) => {
  const response = await executeProtectedQuery(sessionContext, `user`, 'DELETE', null, {});
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('delete account: ' + response.data.message);
  }
};
