import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { EditImageType, UserData } from '../../types';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import { uploadProfilePicture } from '../../db_utils/uploadProfilePicture';
import { useSessionContext } from '../../../SessionContext';
import {
  PROFILE_PICTURE_SIZE_LIMIT,
  SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY,
} from '../../constants';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getInfoAsync } from 'expo-file-system';
import { formatBytes } from '../../utils/reusableStuff';
import { prepareFileToUpload } from '../../utils/storageUtils';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ImageWrapper from '../../genericComponents/ImageWrapper';
import { useAddPictureContext } from '../../context/AddPictureContext';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { BarrelIcon, Feather2Icon } from '../../utils/icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type ImageDimensions = { width: number; height: number };

const ICON_SIZE = 50;

const AddPicture = () => {
  const { t } = useTranslation();

  const { imageType, tempImage, setTempImage } = useEditItemContext();
  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const addPictureContext = useAddPictureContext();
  const jokerContext = useJokerContext();

  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tempImage) {
      addPictureContext.setImage(tempImage);
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
      setOriginalFileSize(result.assets[0].fileSize || null);
      addPictureContext.setImage(result.assets[0].uri);
    }
  };

  const getImageDimensions = async (): Promise<ImageDimensions> => {
    return await (async () => {
      return new Promise((resolve, reject) => {
        if (!addPictureContext.image) {
          reject('could not read image');
          return;
        }
        Image.getSize(addPictureContext.image, (width, height) => {
          resolve({ width, height });
        });
      });
    })();
  };

  const resizeImage = async () => {
    if (!addPictureContext.image) {
      throw new Error('image not set');
    }
    let fileInfo = await getInfoAsync(addPictureContext.image);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    let { width, height } = await getImageDimensions();
    let uri = addPictureContext.image;

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
    jokerContext.showInfo(t('profile_image_scaled', { size: originalFileSizeInfo }));
    addPictureContext.setImage(uri);
  };

  useEffect(() => {
    setError('');
    (async () => {
      if (!addPictureContext.image) {
        return;
      }
      const fileInfo = await getInfoAsync(addPictureContext.image);
      try {
        if (fileInfo.exists && fileInfo.size > PROFILE_PICTURE_SIZE_LIMIT) {
          setLoading(true);
          resizeImage();
        } else {
          setLoading(false);
        }
      } catch (e) {
        handleError(t, jokerContext, ErrorType.SCALE_IMAGE, `${e}`);
      }
    })();
  }, [addPictureContext.image]);

  const confirm = async () => {
    if (!addPictureContext.image) {
      handleError(t, jokerContext, ErrorType.UPLOAD_IMAGE, 'image not set');
      return;
    }
    setLoading(true);
    switch (imageType) {
      case EditImageType.profile: {
        try {
          const fileInfo = await getInfoAsync(addPictureContext.image);

          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }
          if (fileInfo.size > PROFILE_PICTURE_SIZE_LIMIT) {
            throw new Error('Image is too big');
          }
          const prepareFileResult = await prepareFileToUpload(
            t,
            jokerContext,
            addPictureContext.image
          );
          if (!prepareFileResult) {
            throw new Error('could not prepare file');
          }
          const { fileName, fileMimeType, fileContent } = prepareFileResult;
          const response = await uploadProfilePicture(
            sessionContext,
            fileName,
            fileMimeType,
            fileContent
          );
          setLoading(false);
          userContext.setData({
            ...userContext.data,
            profilePicture: response.profilePicture,
          } as UserData);
          jokerContext.showSuccess(t('profile_successfully_uploaded_image'));
        } catch (e) {
          handleError(t, jokerContext, ErrorType.UPLOAD_IMAGE, `${e}`);
        }
        router.back();
        break;
      }
      case EditImageType.item: {
        setTempImage(addPictureContext.image);
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
        <Feather2Icon width={ICON_SIZE} height={ICON_SIZE} />
        <TextWrapper style={styles.label}>{t('profile_take_a_new_picture')}</TextWrapper>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.iconWrapper}
        onPress={() => {
          pickImage();
        }}
      >
        <BarrelIcon width={ICON_SIZE} height={ICON_SIZE} />
        <TextWrapper style={styles.label}>{t('profile_load_image_from_disk')}</TextWrapper>
      </TouchableOpacity>
      {addPictureContext.image && (
        <View style={styles.imageWrapper}>
          <ImageWrapper style={styles.image} uri={addPictureContext.image} />
          <ButtonWrapper
            title={t('add')}
            onPress={confirm}
            disabled={loading || !!error}
            fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
          />
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
  label: {
    fontSize: 20,
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
