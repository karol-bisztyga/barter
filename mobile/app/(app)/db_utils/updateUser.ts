import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const updateUser = async (
  sessionContext: SessionContextState,
  fieldName: string,
  fieldValue: string
) => {
  const response = await executeProtectedQuery(sessionContext, `user`, 'PUT', null, {
    fieldName,
    fieldValue,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('update item error: ' + response.data.message);
  }
};
