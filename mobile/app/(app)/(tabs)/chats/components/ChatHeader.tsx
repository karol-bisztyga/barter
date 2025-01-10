import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useUserContext } from '../../../context/UserContext';
import { useItemsContext } from '../../../context/ItemsContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import { useJokerContext } from '../../../context/JokerContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { GoldGradient } from '../../../genericComponents/gradients/GoldGradient';
import ImageWrapper from '../../../genericComponents/ImageWrapper';
import { GOLD_COLOR_1, PRESSABLE_ACTIVE_OPACITY } from '../../../constants';
import { SeparatorVertical } from './SeparatorVertical';

const IMAGE_SIZE = 128;
const IMAGE_BORDER_SIZE = 2;

const ChatHeader = () => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();
  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const settingsContext = useSettingsContext();

  const { usersItemId, othersItem } = itemsContext;

  const usersItem = userContext.findItemById(usersItemId);
  if (!usersItem || !othersItem) {
    handleError(t, jokerContext, ErrorType.CORRUPTED_SESSION);
    return null;
  }

  return (
    <View style={styles.itemsWrapper}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.imageWrapper}
          activeOpacity={PRESSABLE_ACTIVE_OPACITY}
          onPress={() => {
            settingsContext.playSound('click');
            router.push({ pathname: 'chats/item', params: { whosItem: 'self' } });
          }}
        >
          <GoldGradient />
          <ImageWrapper style={styles.image} uri={usersItem.item.images[0]} />
        </TouchableOpacity>
      </View>
      <SeparatorVertical />
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.imageWrapper}
          activeOpacity={PRESSABLE_ACTIVE_OPACITY}
          onPress={() => {
            settingsContext.playSound('click');
            router.push({ pathname: 'chats/item', params: { whosItem: 'other' } });
          }}
        >
          <GoldGradient />
          <ImageWrapper style={styles.image} uri={othersItem.images[0]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: GOLD_COLOR_1,
    paddingVertical: 24,
  },
  iconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  imageContainer: {
    flex: 4,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  image: {
    margin: IMAGE_BORDER_SIZE,
    width: IMAGE_SIZE - IMAGE_BORDER_SIZE * 2,
    height: IMAGE_SIZE - IMAGE_BORDER_SIZE * 2,
  },
});

export default ChatHeader;
