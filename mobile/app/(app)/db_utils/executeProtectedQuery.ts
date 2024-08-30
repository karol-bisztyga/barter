import { SessionContextState } from '../../SessionContext';
import { showError } from '../utils/notifications';
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
    if (rawUrl.at(0) === '/') {
      throw new Error('url should not start with /');
    }
    const result = await executeQuery(
      rawUrl,
      method,
      urlParams,
      body,
      sessionContext.session || undefined
    );

    if (!result.ok && result.data.message.includes('Invalid token')) {
      showError('session expired');
      sessionContext.signOut();
    }
    return result;
  } catch (e) {
    showError('server error occured');
    console.error('error executeProtectedQuery', e);
    throw e;
  }
};
