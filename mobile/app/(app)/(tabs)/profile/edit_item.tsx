import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { EditImageType, ItemData, RemoveMatchData } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import {
  MAX_ITEM_PICTURES,
  SWIPE_BASE_BACKGROUND_COLOR,
  SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY,
} from '../../constants';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import { updateItem } from '../../db_utils/updateItem';
import { addItem } from '../../db_utils/addItem';
import { removeItem } from '../../db_utils/removeItem';
import { deleteItemImage } from '../../db_utils/deleteItemImage';
import { uploadItemImage } from '../../db_utils/uploadItemImage';
import { prepareFileToUpload } from '../../utils/storageUtils';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper, { BUTTON_HEIGHT } from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { FILL_COLOR } from './components/items/editing_panels/constants';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSocketContext } from '../../context/SocketContext';
import Background from '../../components/Background';
import { capitalizeFirstLetterOfEveryWord } from '../../utils/reusableStuff';
import { Picture } from './components/edit_item/Picture';
import { BottomButtons } from './components/edit_item/BottomButtons';

const { width } = Dimensions.get('window');

const IMAGE_SIZE = (width * 3) / 4;
const REMOVE_IMAGE_ICON_SIZE = 50;
const BOTTOM_SHEET_HEIGHT = BUTTON_HEIGHT;

const EditItem = () => {
  const { t } = useTranslation();

  const sessionContext = useAuth();

  const { usersItemId } = useItemsContext();

  const editItemContext = useEditItemContext();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();
  const socketContext = useSocketContext();

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

        const prepareFileResult = await prepareFileToUpload(t, jokerContext, imageUri);
        if (!prepareFileResult) {
          throw new Error('could not prepare file');
        }
        const { fileName, fileMimeType, fileContent } = prepareFileResult;
        const response = await uploadItemImage(
          sessionContext,
          usersItemId,
          fileName,
          fileMimeType,
          fileContent
        );
        jokerContext.showSuccess(t('profile_successfully_uploaded_image'));
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
        handleError(t, jokerContext, ErrorType.UPLOAD_IMAGE, `${e}`);
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
      images: [],
      description,
    };
    const addItemResult = await addItem(sessionContext, newItem);

    // add images
    const uploadedImages = [];
    for (const picture of pictures) {
      const prepareFileResult = await prepareFileToUpload(t, jokerContext, picture);
      if (!prepareFileResult) {
        throw new Error('could not prepare file');
      }
      const { fileName, fileMimeType, fileContent } = prepareFileResult;
      const uploadImageResult = await uploadItemImage(
        sessionContext,
        addItemResult.id,
        fileName,
        fileMimeType,
        fileContent
      );
      uploadedImages.push(uploadImageResult.url);
    }

    addItemResult.images = uploadedImages;
    newItems.push(addItemResult);
    return newItems;
  };

  const removePicture = async (index: number) => {
    try {
      if (!usersItemId || !usersItem) {
        throw new Error('trying to remove non-existing item');
      }

      const remove: boolean = await new Promise((resolve) => {
        Alert.alert(
          t('profile_remove_picture_question'),
          '',
          [
            { text: t('profile_remove_picture_no'), onPress: () => resolve(false) },
            {
              text: t('profile_remove_picture_yes'),
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
      jokerContext.showSuccess(t('profile_image_removed'));
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
      handleError(t, jokerContext, ErrorType.REMOVE_IMAGE, `${e}`);
      setRemovingImage(null);
    }
  };

  const save = async () => {
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
      if (action === 'updating') {
        newItems = await updateItemHandler();
        jokerContext.showSuccess(t('profile_item_updated'));
      } else if (action === 'adding') {
        newItems = await addItemHandler();
        jokerContext.showSuccess(t('profile_item_added'));
      } else {
        throw new Error('invalid action: ' + action);
      }
      userContext.setItems(newItems);
      router.back();
    } catch (e) {
      if (action === 'updating') {
        handleError(t, jokerContext, ErrorType.UPDATE_ITEM, `${e}`);
      } else if (action === 'adding') {
        handleError(t, jokerContext, ErrorType.ADD_ITEM, `${e}`);
      }
    } finally {
      setUpdatingItemData(false);
    }
  };

  const addImage = () => {
    editItemContext.setImageType(EditImageType.item);
    editItemContext.setItemId(usersItem?.item.id || null);
    router.push('profile/add_picture');
  };

  const removeItemPress = async () => {
    const remove: boolean = await new Promise((resolve) => {
      Alert.alert(
        t('profile_remove_item_question_title'),
        t('profile_remove_item_question_subtitle'),
        [
          { text: t('profile_remove_item_question_no'), onPress: () => resolve(false) },
          {
            text: t('profile_remove_item_question_yes'),
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
        const result: RemoveMatchData[] = await removeItem(sessionContext, usersItem.item.id);
        // update matches - removeItem returns all the removed matches' ids
        // instead of updating matches right away, send through socket info to both owners and only then each of them can remove the match from the state
        if (result.length) {
          socketContext.sendRemoveMatch(result);
        }
        //
        newItems.splice(usersItem.index, 1);
        userContext.setItems(newItems);
        jokerContext.showSuccess(t('profile_item_removed'));
        router.back();
      } catch (e) {
        handleError(t, jokerContext, ErrorType.REMOVE_ITEM, `${e}`);
        return;
      } finally {
        setRemovingUtem(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <ScrollView ref={scrollRef}>
        <View style={styles.margins}>
          <InputWrapper
            placeholder={capitalizeFirstLetterOfEveryWord(t('profile_name_title'))}
            value={name}
            onChangeText={setName}
            fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
          />
        </View>
        <View style={[styles.descriptionInputWrapper, styles.margins]}>
          <InputWrapper
            placeholder={capitalizeFirstLetterOfEveryWord(t('profile_description_title'))}
            multiline={true}
            value={description}
            onChangeText={setDescription}
            fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
            style={styles.descriptionInput}
            textAlignVertical="top"
          />
        </View>
        <TextWrapper style={styles.picturesTitle}>
          {capitalizeFirstLetterOfEveryWord(t('profile_pictures_title'))}
        </TextWrapper>
        <View style={styles.imageSlotsWrapper}>
          {pictures.map((picture, index) => {
            const isCurrentImageBeingRemoved = removingImage === index;
            const removingDisabled = pictures.length <= 1;
            return (
              <Picture
                key={index}
                index={index}
                uri={picture}
                removePicture={removePicture}
                removingDisabled={removingDisabled}
                isBeingRemoved={isCurrentImageBeingRemoved}
              />
            );
          })}
          {uploadingImage && (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" />
            </View>
          )}
          <BottomButtons
            addImage={addImage}
            removeImage={removeItemPress}
            addImageDisabled={uploadingImage || pictures.length >= MAX_ITEM_PICTURES}
          />
        </View>
        {removingItem && (
          <View
            style={[styles.loaderWrapper, { marginTop: 0 }]}
            onLayout={() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomSheetSpace} />
      <View style={styles.bottomSheetContainer}>
        <ButtonWrapper
          title={capitalizeFirstLetterOfEveryWord(t('save'))}
          disabled={!validateForm() || !checkIfItemEdited()}
          onPress={save}
          mode="black"
        />
      </View>
      {updatingItemData && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  picturesTitle: {
    fontSize: 22,
    marginTop: 24,
    marginHorizontal: 12,
  },
  margins: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  descriptionInputWrapper: {
    height: 200,
  },
  descriptionInput: {
    height: '100%',
  },
  imageSlotsWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSlot: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 10,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  submitButton: {
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  removeImageWrapper: {
    position: 'absolute',
    width: REMOVE_IMAGE_ICON_SIZE,
    height: REMOVE_IMAGE_ICON_SIZE,
    bottom: 0,
    right: -REMOVE_IMAGE_ICON_SIZE / 4,
    borderRadius: REMOVE_IMAGE_ICON_SIZE,
    borderWidth: 3,
    borderColor: SWIPE_BASE_BACKGROUND_COLOR,
    backgroundColor: FILL_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    margin: 20,
  },
  loaderWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imageRemoveLoader: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: IMAGE_SIZE / 2 - 50,
    left: IMAGE_SIZE / 2 - 50,
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: BOTTOM_SHEET_HEIGHT + 8 * 2,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  bottomSheetSpace: {
    width: '100%',
    height: BOTTOM_SHEET_HEIGHT + 8 * 2,
  },
});

export default EditItem;
