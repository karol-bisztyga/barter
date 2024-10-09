import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

type Update = {
  field: string;
  value: string;
};

export const updateUser = async (sessionContext: SessionContextState, updates: Update[]) => {
  const response = await executeProtectedQuery(sessionContext, `user`, 'PUT', null, {
    updates: JSON.stringify(updates),
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('update user error: ' + response.data.message);
  }
};
