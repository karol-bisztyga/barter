import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const changePassword = async (
  sessionContext: SessionContextState,
  currentPassword: string,
  newPassword: string
) => {
  const response = await executeProtectedQuery(sessionContext, `user/password`, 'PUT', null, {
    currentPassword,
    newPassword,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('update user error: ' + response.data.message);
  }
};
