import { lookup, extension } from 'react-native-mime-types';
import { EncodingType, readAsStringAsync } from 'expo-file-system';
import { JokerContextState } from '../context/JokerContext';
import { ErrorType, handleError } from './errorHandler';
import { TFunction } from 'i18next';

export const prepareFileToUpload = async (
  t: TFunction,
  jokerContext: JokerContextState,
  uri: string
) => {
  const fileName = uri.split('/').pop();
  if (!fileName) {
    handleError(t, jokerContext, ErrorType.NO_FILE_NAME);
    return null;
  }
  const fileType = fileName.split('.').pop();
  if (!fileType) {
    handleError(t, jokerContext, ErrorType.NO_FILE_TYPE);
    return null;
  }
  const fileMimeType = lookup(fileType);
  if (!fileMimeType) {
    handleError(t, jokerContext, ErrorType.FILE_TYPE_INVALID);
    return null;
  }
  const fileExtension = extension(fileType);
  const fileContent = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });

  return { fileName, fileType, fileMimeType, fileContent, fileExtension };
};
