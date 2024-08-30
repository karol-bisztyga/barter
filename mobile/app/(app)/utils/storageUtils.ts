import { lookup, extension } from 'react-native-mime-types';
import { EncodingType, readAsStringAsync } from 'expo-file-system';

export const prepareFileToUpload = async (uri: string) => {
  const fileName = uri.split('/').pop();
  if (!fileName) {
    throw new Error('No file name detected');
  }
  const fileType = fileName.split('.').pop();
  if (!fileType) {
    throw new Error('No type name detected');
  }
  const fileMimeType = lookup(fileType);
  if (!fileMimeType) {
    throw new Error('file type could not be read properly');
  }
  const fileExtension = extension(fileType);
  const fileContent = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });

  return { fileName, fileType, fileMimeType, fileContent, fileExtension };
};
