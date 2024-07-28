import React, { useEffect, useState } from 'react';
import { Button, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useEditImageContext } from '../../context/EditImageContext';
import { EditImagePurpose, EditImageType } from '../../types';
import { useUserContext } from '../../context/UserContext';
import { router } from 'expo-router';
import { MAX_ITEM_PICTURES } from '../../constants';

const { width } = Dimensions.get('window');

const AddPicture = () => {
  const { imageType, itemId, purpose, previousImage } = useEditImageContext();
  const userContext = useUserContext();

  const [image, setImage] = useState<string>('');

  console.log('editImageContext', imageType, purpose, previousImage);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  console.log('>>> CHECK', userContext.findItemById(itemId)?.item.images.length);

  useEffect(() => {}, []);

  const confirm = () => {
    if (!image) {
      throw new Error('no image detected');
    }
    console.log(
      'confirming image',
      userContext.items.map((item) => item.id)
    );
    switch (imageType) {
      case EditImageType.profile: {
        userContext.setProfilePic(image);
        router.back();
        break;
      }
      case EditImageType.item: {
        let targetItemIndex = null;
        const targetItem = userContext.items.find((item, index) => {
          if (item.id === itemId) {
            targetItemIndex = index;
            return true;
          }
        });
        if (!targetItem || targetItemIndex === null) {
          throw new Error(`item with id ${itemId} not found`);
        }
        if (purpose === EditImagePurpose.addNew) {
          //... itemId etc
          // also todo powinno byc tylko 1 source of truth, item context jako user item powinno trzymac
          // tylko id i reszta danych powinna leciec z user context
          if (targetItem.images.length >= MAX_ITEM_PICTURES) {
            console.log('>>>', targetItem.images);
            throw new Error(
              `cannot add more pictures to the item ${itemId} / ${targetItem.images.length} / ${MAX_ITEM_PICTURES}`
            );
          }
          console.log('im about to add new image to item', targetItemIndex, image);

          const newItems = userContext.items;
          newItems[targetItemIndex].images.push(image);
          userContext.setItems(newItems);
          router.back();
        } else if (purpose === EditImagePurpose.replace) {
          throw new Error('todo implement this');
        }
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
          console.log('use camera');
        }}
      >
        <FontAwesome size={30} name="camera" />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.iconWrapper}
        onPress={() => {
          console.log('use disk');
          pickImage();
        }}
      >
        <FontAwesome size={30} name="upload" />
      </TouchableOpacity>
      {image && (
        <View style={styles.imageWrapper}>
          <Image style={styles.image} source={{ uri: image }} />
          <Button title="Save" onPress={confirm} />
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
