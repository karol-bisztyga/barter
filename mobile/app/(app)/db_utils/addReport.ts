import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const addReport = async (
  sessionContext: SessionContextState,
  reportedItemId: string,
  reason: string
) => {
  const response = await executeProtectedQuery(sessionContext, `reports`, 'POST', null, {
    reportedItemId,
    reason,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('add report error: ' + response.data.message);
  }
};
