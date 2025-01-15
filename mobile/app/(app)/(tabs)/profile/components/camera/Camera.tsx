import React, { useRef, useState } from 'react';
import { CameraView, CameraType } from 'expo-camera';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ErrorType, handleError } from '../../../../utils/errorHandler';
import { useJokerContext } from '../../../../context/JokerContext';
import { useTranslation } from 'react-i18next';
import { BUTTON_SIZE } from './constants';
import { WHITE_COLOR } from '../../../../constants';

const { width } = Dimensions.get('window');

export const Camera = ({
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
    <View style={styles.cameraWrapper}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
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
    color: WHITE_COLOR,
  },
});
