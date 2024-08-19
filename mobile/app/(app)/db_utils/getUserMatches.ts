import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const getUserMatches = async (
  sessionContext: SessionContextState,
  localDateUpdated: string | null
) => {
  try {
    const response = await executeProtectedQuery(
      sessionContext,
      'matches',
      'GET',
      { localDateUpdated: localDateUpdated || '' },
      null
    );
    if (response.ok) {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (e) {
    throw new Error('get user matches error: ' + e);
  }
};
