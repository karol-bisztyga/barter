import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AddButton from '../../components/AddButton';
import { EditImageType, ItemBorderRadius, ItemData } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import {
  MAX_ITEM_PICTURES,
  SWIPE_BASE_BACKGROUND_COLOR,
  SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY,
} from '../../constants';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import { updateMatches } from '../../utils/reusableStuff';
import { updateItem } from '../../db_utils/updateItem';
import { addItem } from '../../db_utils/addItem';
import { removeItem } from '../../db_utils/removeItem';
import { useMatchContext } from '../../context/MatchContext';
import { deleteItemImage } from '../../db_utils/deleteItemImage';
import { uploadItemImage } from '../../db_utils/uploadItemImage';
import { prepareFileToUpload } from '../../utils/storageUtils';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ImageWrapper from '../../genericComponents/ImageWrapper';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { FILL_COLOR } from './components/items/editing_panels/constants';
import { TorchIcon } from '../../utils/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

const IMAGE_SIZE = (width * 3) / 4;
const REMOVE_IMAGE_ICON_SIZE = 50;

const EditItem = () => {
  const { t } = useTranslation();

  const sessionContext = useAuth();
  const matchContext = useMatchContext();

  const { usersItemId } = useItemsContext();

  const editItemContext = useEditItemContext();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();

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
      if (usersItem) {
        newItems = await updateItemHandler();
      } else {
        newItems = await addItemHandler();
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
        const result = await removeItem(sessionContext, usersItem.item.id);
        await updateMatches(sessionContext, matchContext);
        if (result) {
          newItems.splice(usersItem.index, 1);
          userContext.setItems(newItems);
          jokerContext.showSuccess(t('profile_item_removed'));
          router.back();
        } else {
          throw new Error('server error');
        }
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
      <ScrollView ref={scrollRef}>
        <View style={[styles.nameInputWrapper, styles.margins]}>
          <InputWrapper
            placeholder={t('profile_name_title')}
            value={name}
            onChangeText={setName}
            fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
          />
        </View>
        <View style={[styles.descriptionInputWrapper, styles.margins]}>
          <InputWrapper
            placeholder={t('profile_description_title')}
            multiline={true}
            value={description}
            onChangeText={setDescription}
            fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
          />
        </View>
        <View style={[styles.addButtonWrapper, styles.margins]}>
          <ButtonWrapper
            title={t('save')}
            disabled={!validateForm() || !checkIfItemEdited()}
            onPress={save}
            fillColor={FILL_COLOR}
          />
        </View>

        {updatingItemData && (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <TextWrapper style={styles.sectionTitle}>{t('profile_pictures_title')}</TextWrapper>
        <View style={styles.imageSlotsWrapper}>
          {pictures.map((picture, index) => {
            const isCurrentImageBeingRemoved = removingImage === index;
            return (
              <View style={styles.imageSlot} key={index}>
                <ImageWrapper
                  uri={picture}
                  style={[styles.imageSlot, { opacity: isCurrentImageBeingRemoved ? 0.3 : 1 }]}
                />
                {isCurrentImageBeingRemoved && (
                  <ActivityIndicator size="large" style={styles.imageRemoveLoader} />
                )}
                {pictures.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeImageWrapper}
                    activeOpacity={1}
                    onPress={() => removePicture(index)}
                  >
                    <TorchIcon width={30} height={30} />
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
            <View style={styles.imageSlot}>
              <AddButton onPress={addImage} borderRadius={ItemBorderRadius.all} />
            </View>
          )}
        </View>
        <View style={styles.addButton}>
          {usersItemId && (
            <View style={[styles.nameInputWrapper, styles.margins]}>
              <ButtonWrapper
                color="red"
                title={t('profile_remove_item_title')}
                onPress={removeItemPress}
                fillColor={FILL_COLOR}
              />
            </View>
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
  margins: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  nameInputWrapper: {
    height: 52,
  },
  descriptionInputWrapper: {
    height: 200,
  },
  addButtonWrapper: {},
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveLoader: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: IMAGE_SIZE / 2 - 50,
    left: IMAGE_SIZE / 2 - 50,
  },
});

export default EditItem;
