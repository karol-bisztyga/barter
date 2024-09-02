import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { EditImageType, UserData } from '../../types';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import { showSuccess } from '../../utils/notifications';
import { uploadProfilePicture } from '../../db_utils/uploadProfilePicture';
import { useSessionContext } from '../../../SessionContext';
import { PROFILE_PICTURE_SIZE_LIMIT } from '../../constants';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getInfoAsync } from 'expo-file-system';
import { formatBytes } from '../../utils/reusableStuff';
import { prepareFileToUpload } from '../../utils/storageUtils';
import { ErrorType, handleError } from '../../utils/errorHandler';

const { width } = Dimensions.get('window');

type ImageDimensions = { width: number; height: number };

const AddPicture = () => {
  const { imageType, tempImage, setTempImage } = useEditItemContext();
  const userContext = useUserContext();
  const sessionContext = useSessionContext();

  const [image, setImage] = useState<string | null>(tempImage);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [warning, setWarning] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tempImage) {
      setImage(tempImage);
    }
    setTempImage(null);
  }, [tempImage]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setWarning('');
      setOriginalFileSize(result.assets[0].fileSize || null);
      setImage(result.assets[0].uri);
    }
  };

  const getImageDimensions = async (): Promise<ImageDimensions> => {
    return await (async () => {
      return new Promise((resolve, reject) => {
        if (!image) {
          reject('could not read image');
          return;
        }
        Image.getSize(image, (width, height) => {
          resolve({ width, height });
        });
      });
    })();
  };

  const resizeImage = async () => {
    if (!image) {
      throw new Error('image not set');
    }
    let fileInfo = await getInfoAsync(image);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    let { width, height } = await getImageDimensions();
    let uri = image;

    while (fileInfo.exists && fileInfo.size > PROFILE_PICTURE_SIZE_LIMIT) {
      const scale = 0.9;
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      const resizedImage = await manipulateAsync(uri, [{ resize: { width, height } }], {
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      uri = resizedImage.uri;
      fileInfo = await getInfoAsync(resizedImage.uri);
    }
    const originalFileSizeInfo = originalFileSize ? `${formatBytes(originalFileSize)}, ` : '';
    setWarning(
      `This image was too big (${originalFileSizeInfo}the limit is 2MB) and has been automatically scaled down, you can proceed or choose another image`
    );
    setImage(uri);
  };

  useEffect(() => {
    if (!image) {
      return;
    }
    (async () => {
      const fileInfo = await getInfoAsync(image);

      if (fileInfo.exists && fileInfo.size > PROFILE_PICTURE_SIZE_LIMIT) {
        setLoading(true);
        resizeImage();
      } else {
        setLoading(false);
      }
    })();
  }, [image]);

  const confirm = async () => {
    if (!image) {
      handleError(ErrorType.UPLOAD_IMAGE, 'image not set');
      return;
    }
    setLoading(true);
    switch (imageType) {
      case EditImageType.profile: {
        try {
          const fileInfo = await getInfoAsync(image);

          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }
          if (fileInfo.size > PROFILE_PICTURE_SIZE_LIMIT) {
            throw new Error('Image is too big');
          }
          const { fileName, fileMimeType, fileContent } = await prepareFileToUpload(image);
          const response = await uploadProfilePicture(
            sessionContext,
            fileName,
            fileMimeType,
            fileContent
          );
          setLoading(false);
          console.log('prof pic', response.profilePicture);
          userContext.setData({
            ...userContext.data,
            profilePicture: response.profilePicture,
          } as UserData);
          showSuccess('successfully uploaded image');
        } catch (e) {
          handleError(ErrorType.UPLOAD_IMAGE, `${e}`);
        }
        router.back();
        break;
      }
      case EditImageType.item: {
        setTempImage(image);
        setLoading(false);
        router.back();
        break;
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.iconWrapper}
        onPress={() => {
          router.push('profile/camera');
        }}
      >
        <FontAwesome size={30} name="camera" />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.iconWrapper}
        onPress={() => {
          pickImage();
        }}
      >
        <FontAwesome size={30} name="upload" />
      </TouchableOpacity>
      {image && (
        <View style={styles.imageWrapper}>
          <Image style={styles.image} source={{ uri: image }} />
          {warning && <Text style={styles.warningText}>{warning}</Text>}
          <Button title="Add" onPress={confirm} disabled={loading} />
          {loading && (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconWrapper: {
    height: width / 4,
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30,
  },
  imageWrapper: {
    flex: 1,
    margin: 30,
    borderRadius: 20,
  },
  image: {
    flex: 1,
    margin: 10,
    borderRadius: 20,
  },
  warningText: {
    color: 'orange',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loaderWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddPicture;
