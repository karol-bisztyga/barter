import { SessionContextState } from '../../SessionContext';
import { executeQuery } from './executeQuery';

export type RestMethod = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const executeProtectedQuery = async (
  sessionContext: SessionContextState,
  rawUrl: string,
  method: RestMethod,
  urlParams?: Record<string, string> | null,
  body?: Record<string, string> | null
) => {
  try {
    const result = await executeQuery(
      rawUrl,
      method,
      urlParams,
      body,
      sessionContext.session || undefined
    );

    if (!result.ok && result.data.message === 'Invalid token') {
      console.log('invalid token');
      sessionContext.signOut();
    }
    return result;
  } catch (e) {
    console.error('error executeProtectedQuery', e);
    throw e;
  }
};
