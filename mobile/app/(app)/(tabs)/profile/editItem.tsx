import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AddButton from '../../components/AddButton';
import { EditImageType, ItemBorderRadius, ItemData } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { MAX_ITEM_PICTURES } from '../../constants';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import { authorizeUser, updateMatches } from '../../utils/reusableStuff';
import { updateItem } from '../../db_utils/updateItem';
import { addItem } from '../../db_utils/addItem';
import { removeItem } from '../../db_utils/removeItem';
import { useMatchContext } from '../../context/MatchContext';
import { showSuccess } from '../../utils/notifications';
import { deleteItemImage } from '../../db_utils/deleteItemImage';
import { uploadItemImage } from '../../db_utils/uploadItemImage';
import { prepareFileToUpload } from '../../utils/storageUtils';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ImageWrapper from '../../components/ImageWrapper';

const { width } = Dimensions.get('window');

const EditItem = () => {
  const sessionContext = authorizeUser();
  const matchContext = useMatchContext();

  const imageSize = (width * 3) / 4;

  const { usersItemId } = useItemsContext();

  const editItemContext = useEditItemContext();
  const userContext = useUserContext();

  const usersItem = userContext.findItemById(usersItemId);

  const [name, setName] = useState<string>(usersItem?.item.name ?? '');
  const [description, setDescription] = useState<string>(usersItem?.item.description ?? '');
  const [pictures, setPictures] = useState<Array<string>>(usersItem?.item.images ?? []);

  const [updatingItemData, setUpdatingItemData] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [removingImage, setRemovingImage] = useState<number | null>(null);
  const [removingItem, setRemovingUtem] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!editItemContext.tempImage) {
      return;
    }
    if (!usersItemId) {
      setPictures([...pictures, editItemContext.tempImage]);
      editItemContext.setTempImage(null);
      return;
    }

    (async () => {
      try {
        const imageUri = editItemContext.tempImage;
        if (!imageUri) {
          throw new Error('could not read image');
        }
        const imageName = imageUri.split('/').pop();
        if (!imageName) {
          throw new Error('could not properly read file name');
        }

        setUploadingImage(true);

        const { fileName, fileMimeType, fileContent } = await prepareFileToUpload(imageUri);

        const response = await uploadItemImage(
          sessionContext,
          usersItemId,
          fileName,
          fileMimeType,
          fileContent
        );
        showSuccess('Image uploaded');
        const newPictures = [...pictures, response.url];
        setPictures(newPictures);
        userContext.setItems(
          userContext.items.map((item) => {
            if (item.id === usersItemId) {
              return {
                ...item,
                images: newPictures,
              };
            }
            return item;
          })
        );
      } catch (e) {
        handleError(ErrorType.UPLOAD_IMAGE, `${e}`);
      } finally {
        setUploadingImage(false);
      }
      editItemContext.setTempImage(null);
    })();
  }, [editItemContext.tempImage]);

  const checkIfImagesChanged = (): boolean => {
    if (!usersItem) {
      return !!pictures.length;
    }
    return usersItem.item.images !== pictures;
  };

  const checkIfItemEdited = (): boolean => {
    if (!usersItem) {
      return !!(name || description);
    }
    return usersItem.item.name !== name || usersItem.item.description !== description;
  };

  useEffect(() => {
    editItemContext.setEdited(checkIfItemEdited());
  }, [name, description]);

  const validateForm = () => {
    if (!name || !description || !pictures.length) {
      return false;
    }
    return true;
  };

  const updateItemHandler = async (): Promise<ItemData[]> => {
    const newItems = [...userContext.items];
    if (!usersItemId) {
      throw new Error('item id not provided');
    }
    if (!usersItem) {
      throw new Error('item not found');
    }
    const updatedItem = {
      ...usersItem.item,
      name,
      description,
    };

    const result = await updateItem(sessionContext, updatedItem, checkIfImagesChanged());
    newItems[usersItem.index] = { ...newItems[usersItem.index], ...result };

    return newItems;
  };

  const addItemHandler = async (): Promise<ItemData[]> => {
    const newItems = [...userContext.items];
    const newItem: ItemData = {
      id: '',
      name,
      images: pictures,
      description,
    };
    const result = await addItem(sessionContext, newItem);
    newItems.push(result);
    return newItems;
  };

  const removePicture = async (index: number) => {
    try {
      if (!usersItemId || !usersItem) {
        throw new Error('trying to remove non-existing item');
      }

      const remove: boolean = await new Promise((resolve) => {
        Alert.alert(
          'Do you really want to remove this image?',
          '',
          [
            { text: 'Keep it', onPress: () => resolve(false) },
            {
              text: 'Yes, remove it',
              onPress: () => resolve(true),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
      });

      if (!remove) {
        return;
      }

      setRemovingImage(index);

      const newPictures = [...pictures];
      const imageToRemove = newPictures.splice(index, 1)[0];
      await deleteItemImage(sessionContext, usersItemId, imageToRemove);
      setRemovingImage(null);
      setPictures(newPictures);
      showSuccess('Image removed');
      userContext.setItems(
        userContext.items.map((item) => {
          if (item.id === usersItemId) {
            return {
              ...item,
              images: newPictures,
            };
          }
          return item;
        })
      );
    } catch (e) {
      handleError(ErrorType.REMOVE_IMAGE, `${e}`);
      setRemovingImage(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef}>
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
        <Button
          title="Save"
          disabled={!validateForm() || !checkIfItemEdited()}
          onPress={async () => {
            const action = usersItem ? 'updating' : 'adding';
            try {
              if (!validateForm()) {
                throw new Error('form invalid');
              }
              if (!checkIfItemEdited()) {
                return;
              }
              let newItems: ItemData[];
              setUpdatingItemData(true);
              if (usersItem) {
                newItems = await updateItemHandler();
              } else {
                newItems = await addItemHandler();
              }
              userContext.setItems(newItems);
              router.back();
            } catch (e) {
              if (action === 'updating') {
                handleError(ErrorType.UPDATE_ITEM, `${e}`);
              } else if (action === 'adding') {
                handleError(ErrorType.ADD_ITEM, `${e}`);
              }
            } finally {
              setUpdatingItemData(false);
            }
          }}
        />

        {updatingItemData && (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <Text style={styles.sectionTitle}>Pictures</Text>
        <View style={styles.imageSlotsWrapper}>
          {pictures.map((picture, index) => {
            const isCurrentImageBeingRemoved = removingImage === index;
            return (
              <View style={[styles.imageSlot, { width: imageSize, height: imageSize }]} key={index}>
                <ImageWrapper
                  uri={picture}
                  style={[styles.imageSlot, { opacity: isCurrentImageBeingRemoved ? 0.3 : 1 }]}
                />
                {isCurrentImageBeingRemoved && (
                  <ActivityIndicator
                    size="large"
                    style={{
                      position: 'absolute',
                      width: 100,
                      height: 100,
                      top: imageSize / 2 - 50,
                      left: imageSize / 2 - 50,
                    }}
                  />
                )}
                {pictures.length > 1 && (
                  <TouchableOpacity
                    style={styles.editImageWrapper}
                    activeOpacity={1}
                    onPress={() => removePicture(index)}
                  >
                    <FontAwesome size={30} name="trash" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {uploadingImage && (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {!uploadingImage && pictures.length < MAX_ITEM_PICTURES && (
            <View style={[styles.imageSlot, { width: imageSize, height: imageSize }]}>
              <AddButton
                onPress={() => {
                  editItemContext.setImageType(EditImageType.item);
                  editItemContext.setItemId(usersItem?.item.id || null);
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
              onPress={async () => {
                const remove: boolean = await new Promise((resolve) => {
                  Alert.alert(
                    'Do you really want to remove this item?',
                    'All chats related to this item will be removed as well',
                    [
                      { text: 'Keep it', onPress: () => resolve(false) },
                      {
                        text: 'Yes, remove it',
                        onPress: () => resolve(true),
                        style: 'destructive',
                      },
                    ],
                    { cancelable: false }
                  );
                });
                if (remove) {
                  try {
                    if (!usersItem) {
                      throw new Error('item to remove not specified');
                    }
                    setRemovingUtem(true);
                    const newItems = [...userContext.items];
                    const result = await removeItem(sessionContext, usersItem.item.id);
                    await updateMatches(sessionContext, matchContext);
                    if (result) {
                      newItems.splice(usersItem.index, 1);
                      userContext.setItems(newItems);
                      showSuccess('Item removed');
                      router.back();
                    } else {
                      throw new Error('server error');
                    }
                  } catch (e) {
                    handleError(ErrorType.REMOVE_ITEM, `${e}`);
                    return;
                  } finally {
                    setRemovingUtem(false);
                  }
                }
              }}
            />
          )}
          {removingItem && (
            <View
              style={styles.loaderWrapper}
              onLayout={() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          )}
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
  loaderWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditItem;
