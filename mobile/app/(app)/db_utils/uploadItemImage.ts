import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const uploadItemImage = async (
  sessionContext: SessionContextState,
  itemId: string,
  fileName: string,
  fileType: string,
  fileContent: string
) => {
  const response = await executeProtectedQuery(sessionContext, `items/image`, 'PUT', null, {
    itemId,
    fileName,
    fileType,
    fileContent,
  });
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('upload item image: ' + response.data.message);
  }
};
