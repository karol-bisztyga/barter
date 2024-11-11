import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import ImageWrapper from '../../../../genericComponents/ImageWrapper';
import { useAddPictureContext } from '../../../../context/AddPictureContext';
import { BUTTON_SIZE } from './constants';

const { width } = Dimensions.get('window');

export const Preview = ({
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
    <View style={styles.container}>
      <ImageWrapper uri={currentPhoto} style={styles.imageWrapper} />

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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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
  imageWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
  },
});
