import React, { useEffect, useState } from 'react';
import { Button, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { EditImageType, UserData } from '../../types';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import { showError } from '../../utils/notifications';

const { width } = Dimensions.get('window');

const AddPicture = () => {
  const { imageType, tempImage, setTempImage } = useEditItemContext();
  const userContext = useUserContext();

  const [image, setImage] = useState<string | null>(tempImage);

  useEffect(() => {
    setImage(tempImage);
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
      setImage(result.assets[0].uri);
    }
  };

  const confirm = () => {
    if (!image) {
      showError('No image detected');
      console.error('no image detected');
      return;
    }
    switch (imageType) {
      case EditImageType.profile: {
        userContext.setData({
          ...userContext.data,
          profilePicture: image,
        } as UserData);
        router.back();
        break;
      }
      case EditImageType.item: {
        setTempImage(image);
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
          <Button title="Add" onPress={confirm} />
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
});

export default AddPicture;
