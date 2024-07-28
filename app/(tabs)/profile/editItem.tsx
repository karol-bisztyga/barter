import React, { useEffect, useState } from 'react';
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AddButton from '../../components/AddButton';
import { EditImageType, ItemBorderRadius } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { MAX_ITEM_PICTURES, MAX_ITEMS_SLOTS } from '../../constants';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useEditImageContext } from '../../context/EditImageContext';
import { useUserContext } from '../../context/UserContext';
import { generateItemId } from '../../mocks/itemsMocker';

const { width } = Dimensions.get('window');

const EditItem = () => {
  const imageSize = (width * 3) / 4;

  const { usersItemId } = useItemsContext();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pictures, setPictures] = useState<Array<string>>([]);

  const editImageContext = useEditImageContext();
  const userContext = useUserContext();
  const usersItem = userContext.findItemById(usersItemId);

  useEffect(() => {
    setName(usersItem?.item.name ?? '');
    setDescription(usersItem?.item.description ?? '');
    setPictures(usersItem?.item.images ?? []);
  }, []);

  useEffect(() => {
    if (editImageContext.tempImage) {
      setPictures([...pictures, editImageContext.tempImage]);
      editImageContext.setTempImage(null);
    }
  });

  const validateForm = () => {
    if (!name || !description || !pictures.length) {
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={[styles.nameInput, styles.input]}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.descriptionInput, styles.input]}
          placeholder="Description"
          multiline={true}
          value={description}
          onChangeText={setDescription}
        />
        <Text style={styles.sectionTitle}>Pictures</Text>
        <View style={styles.imageSlotsWrapper}>
          {pictures.map((picture, index) => {
            return (
              <View style={[styles.imageSlot, { width: imageSize, height: imageSize }]} key={index}>
                <Image source={{ uri: picture }} style={styles.imageSlot} />
                {pictures.length > 1 && (
                  <TouchableOpacity
                    style={styles.editImageWrapper}
                    activeOpacity={1}
                    onPress={() => {
                      console.log('remove picture');
                      if (!usersItem) {
                        throw new Error('trying to remove non-existing item');
                      }

                      console.log('removing items picture', index);
                      const newPictures = [...pictures];
                      newPictures.splice(index, 1);
                      setPictures(newPictures);
                    }}
                  >
                    <FontAwesome size={30} name="trash" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {pictures.length < MAX_ITEM_PICTURES && (
            <View style={[styles.imageSlot, { width: imageSize, height: imageSize }]}>
              <AddButton
                onPress={() => {
                  console.log('add picture');
                  editImageContext.setImageType(EditImageType.item);
                  editImageContext.setItemId(usersItem?.item.id || null);
                  router.push('profile/addPicture');
                }}
                borderRadius={ItemBorderRadius.all}
              />
            </View>
          )}
        </View>
        <View style={styles.addButton}>
          {usersItemId && (
            <Button
              color="red"
              title="Remove Item"
              onPress={() => {
                console.log('remove item');
              }}
            />
          )}
          <Button
            title="Save"
            disabled={!validateForm()}
            onPress={() => {
              console.log('save item', usersItemId);
              if (!validateForm()) {
                throw new Error('form invalid');
              }
              if (usersItem) {
                // update item
                const newItems = [...userContext.items];
                newItems[usersItem.index] = {
                  ...usersItem.item,
                  name,
                  images: pictures,
                  description,
                };
                userContext.setItems(newItems);
                router.back();
              } else {
                // add new item
                if (userContext.items.length + 1 > MAX_ITEMS_SLOTS) {
                  throw new Error('cannot add more items');
                }
                const newItems = [...userContext.items];
                newItems.push({
                  id: generateItemId(),
                  name,
                  images: pictures,
                  description,
                });
                userContext.setItems(newItems);
                router.back();
              }
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    margin: 10,
    padding: 10,
    fontSize: 30,
  },
  input: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  nameInput: {},
  descriptionInput: {
    height: 120,
  },
  imageSlotsWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSlot: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
  },
  submitButton: {
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  editImageWrapper: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    bottom: 0,
    right: 0,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    margin: 20,
  },
});

export default EditItem;
