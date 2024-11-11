import React, { useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { StyleSheet, View } from 'react-native';
import { Preview } from './components/camera/Preview';
import { Camera } from './components/camera/Camera';
import TextWrapper from '../../genericComponents/TextWrapper';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import { useTranslation } from 'react-i18next';
import { FILL_COLOR } from './components/items/editing_panels/constants';

export default function CameraComponent() {
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
        <Preview currentPhoto={currentPhoto} setCurrentPhoto={setCurrentPhoto} />
      ) : (
        <Camera setCurrentPhoto={setCurrentPhoto} />
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
});
