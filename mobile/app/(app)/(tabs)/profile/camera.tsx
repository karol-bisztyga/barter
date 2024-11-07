import React, { useRef, useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ImageWrapper from '../../genericComponents/ImageWrapper';
import { useAddPictureContext } from '../../context/AddPictureContext';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { useTranslation } from 'react-i18next';
import { FILL_COLOR } from './components/items/editing_panels/constants';

const { width } = Dimensions.get('window');

const BUTTON_SIZE = 70;

const CameraComponent = ({
  setCurrentPhoto,
}: {
  setCurrentPhoto: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();

  const [facing, setFacing] = useState<CameraType>('back');
  const [takingPhotoEnabled, setTakingPhotoEnabled] = useState<boolean>(true);
  const cameraRef = useRef<CameraView>(null);

  const toggleCameraFacing = () => {
    if (!takingPhotoEnabled) {
      return;
    }
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (!takingPhotoEnabled) {
      return;
    }
    try {
      setTakingPhotoEnabled(false);
      if (cameraRef.current === null) {
        throw new Error('camera not detected');
      }
      const photoTaken = await cameraRef.current.takePictureAsync();
      if (!photoTaken) {
        throw new Error('failed to take picture');
      }
      setCurrentPhoto(photoTaken.uri);
    } catch (e) {
      handleError(t, jokerContext, ErrorType.CAMERA, `${e}`);
    } finally {
      setTakingPhotoEnabled(true);
    }
  };

  return (
    <>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      <TouchableOpacity
        style={styles.takePictureButton}
        onPress={takePicture}
        activeOpacity={0.7}
      />
      <TouchableOpacity
        style={styles.toggleCameraFacingButton}
        onPress={toggleCameraFacing}
        activeOpacity={0.7}
      >
        <FontAwesome size={30} name="refresh" style={styles.toggleCameraFacingIcon} />
      </TouchableOpacity>
    </>
  );
};

const ImagePreviewComponent = ({
  currentPhoto,
  setCurrentPhoto,
}: {
  currentPhoto: string;
  setCurrentPhoto: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const addPictureContext = useAddPictureContext();

  const acceptPhoto = () => {
    addPictureContext.setImage(currentPhoto);
    router.back();
  };

  const rejectPhoto = () => {
    setCurrentPhoto(null);
  };

  return (
    <View>
      <ImageWrapper uri={currentPhoto} style={{ width: '100%', height: '100%' }} />

      <View style={styles.decisionButtonsWrapper}>
        <TouchableOpacity onPress={rejectPhoto} activeOpacity={0.7}>
          <FontAwesome name="ban" style={[styles.decisionButton, { color: 'red' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={acceptPhoto} activeOpacity={0.7}>
          <FontAwesome name="check" style={[styles.decisionButton, { color: 'green' }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Camera() {
  const { t } = useTranslation();

  const [permission, requestPermission] = useCameraPermissions();
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TextWrapper style={styles.message}>{t('profile_need_camera_permission')}</TextWrapper>
        <ButtonWrapper
          onPress={requestPermission}
          title={t('profile_grant_permission')}
          fillColor={FILL_COLOR}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentPhoto ? (
        <ImagePreviewComponent currentPhoto={currentPhoto} setCurrentPhoto={setCurrentPhoto} />
      ) : (
        <CameraComponent setCurrentPhoto={setCurrentPhoto} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {},
  takePictureButton: {
    position: 'absolute',
    left: width / 2 - BUTTON_SIZE / 2,
    bottom: 30,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderColor: '#fff',
    borderWidth: 3,
    borderRadius: BUTTON_SIZE,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  toggleCameraFacingButton: {
    position: 'absolute',
    right: 0,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCameraFacingIcon: {
    color: 'white',
  },
  decisionButtonsWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 30,
    left: width / 2 - BUTTON_SIZE - 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decisionButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    textAlign: 'center',
    fontSize: 50,
    lineHeight: BUTTON_SIZE,
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BUTTON_SIZE,
  },
});
