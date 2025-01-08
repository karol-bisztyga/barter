import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ItemData } from '../../../../types';
import { useItemsContext } from '../../../../context/ItemsContext';
import TextWrapper from '../../../../genericComponents/TextWrapper';
import { useSettingsContext } from '../../../../context/SettingsContext';
import {
  generateHarmonicColor,
  hexToRgbaString,
  TargetColor,
} from '../../../../utils/harmonicColors';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../../../../constants';
import { router } from 'expo-router';
import { GoldGradient } from '../../../../genericComponents/GoldGradient';

const IMAGE_SIZE = 164;
const BORDER_SIZE = 2;

const Items = () => {
  const itemsContext = useItemsContext();
  const settingsContext = useSettingsContext();

  const items = itemsContext.usersItemsLikedByTargetItemOwner;

  const [itemChanged, setItemChanged] = useState(false);

  useEffect(() => {
    if (itemChanged) {
      router.back();
    }
  }, [itemChanged]);

  return (
    <View style={styles.container}>
      {items.map((item: ItemData, index: number) => {
        const currentItemSelected = itemsContext.usersItemId === item.id;
        return (
          <View
            style={[
              styles.itemWrapper,
              {
                opacity: currentItemSelected ? 1 : 0.3,
              },
            ]}
            key={index}
          >
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={() => {
                settingsContext.playSound('click');
                if (itemsContext.usersItemId === item.id) {
                  return;
                }
                itemsContext.setUsersItemId(item.id);
                setItemChanged(true);
              }}
            >
              <GoldGradient />
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            </TouchableOpacity>
            <TextWrapper style={styles.labelName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </TextWrapper>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemWrapper: {
    width: '100%',
    height: IMAGE_SIZE + BORDER_SIZE * 2 + 40,
    margin: 20,
    borderColor: hexToRgbaString(
      generateHarmonicColor(SWIPE_BASE_BACKGROUND_COLOR, TargetColor.GREEN),
      0.7
    ),
    alignItems: 'center',
  },
  labelName: {
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 20,
    marginTop: 8,
  },
  imageWrapper: {
    width: IMAGE_SIZE + BORDER_SIZE * 2,
    height: IMAGE_SIZE + BORDER_SIZE * 2,
  },
  image: {
    position: 'absolute',
    top: BORDER_SIZE,
    left: BORDER_SIZE,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    resizeMode: 'cover',
  },
});

export default Items;
