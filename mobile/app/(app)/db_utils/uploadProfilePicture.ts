import { SessionContextState } from '../../SessionContext';
import { executeProtectedQuery } from './executeProtectedQuery';

export const uploadProfilePicture = async (
  sessionContext: SessionContextState,
  fileName: string,
  fileType: string,
  fileContent: string
) => {
  const response = await executeProtectedQuery(
    sessionContext,
    `user/profile_picture`,
    'PUT',
    null,
    {
      fileName,
      fileType,
      fileContent,
    }
  );
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('upload profile picture: ' + response.data.message);
  }
};
