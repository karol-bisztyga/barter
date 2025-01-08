import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ImageWrapper from '../../../../genericComponents/ImageWrapper';
import TextWrapper from '../../../../genericComponents/TextWrapper';
import { useSettingsContext } from '../../../../context/SettingsContext';
import { ARROW_ICON_SIZE } from './editing_panels/constants';
import { BROWN_COLOR_4, GOLD_COLOR_3 } from '../../../../constants';
import { useFont } from '../../../../hooks/useFont';
import { capitalizeFirstLetterOfEveryWord } from '../../../../utils/reusableStuff';

export type LinkItemProps = {
  name: string;
  id: string;
  isLast: boolean;
  onPress: () => void;
  imageUrl?: string;
};

const LinkItem = ({ name, id, isLast, onPress, imageUrl }: LinkItemProps) => {
  const settingsContext = useSettingsContext();

  const fontFamily = useFont();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
      key={id}
      onPress={() => {
        settingsContext.playSound('click');
        onPress();
      }}
    >
      {imageUrl && (
        <View style={styles.imageWrapper}>
          <ImageWrapper uri={imageUrl || ''} style={styles.image} />
        </View>
      )}
      <TextWrapper
        style={[styles.itemTitle, { fontFamily: fontFamily.italic }]}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {capitalizeFirstLetterOfEveryWord(name)}
      </TextWrapper>
      <View style={styles.itemArrowWrapper}>
        <FontAwesome size={ARROW_ICON_SIZE} style={styles.itemArrow} name="chevron-right" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 66,
    borderColor: BROWN_COLOR_4,
    alignSelf: 'flex-start',
  },
  itemTitle: {
    fontSize: 18,
    lineHeight: 26,
    margin: 20,
  },
  itemArrowWrapper: {
    flex: 1,
    textAlign: 'right',
    height: '100%',
    lineHeight: 23,
    width: 16,
    marginLeft: 6,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 20,
  },
  itemArrow: {
    width: ARROW_ICON_SIZE,
    height: ARROW_ICON_SIZE,
    textAlign: 'center',
    color: GOLD_COLOR_3,
  },
  imageWrapper: {
    flex: 1,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 30,
  },
});

export default LinkItem;
