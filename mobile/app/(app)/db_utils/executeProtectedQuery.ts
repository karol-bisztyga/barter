import { SessionContextState } from '../../SessionContext';
import { ErrorType, handleError } from '../utils/errorHandler';
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
      sessionContext.signOut();
      throw new Error(result.data.message);
    }
    return result;
  } catch (e) {
    handleError(ErrorType.SERVER_ERROR, `${e}`);
    throw e;
  }
};
