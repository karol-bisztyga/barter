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
import { GoldGradient } from '../../../../genericComponents/gradients/GoldGradient';
import { ITEM_HEIGHT } from './constants';

const IMAGE_WRAPPER_SIZE = 60;
const IMAGE_SIZE = 36;

export type LinkItemProps = {
  name: string;
  id: string;
  isLast: boolean;
  onPress: () => void;
  imageUrl?: string;
  automaticallyCapitablizeFirstLetters?: boolean;
};

const LinkItem = ({
  name,
  id,
  isLast,
  onPress,
  imageUrl,
  automaticallyCapitablizeFirstLetters = true,
}: LinkItemProps) => {
  const settingsContext = useSettingsContext();

  const [textContainerMaxWidth, setTextContainerMaxWidth] = React.useState<number | null>(null);

  const fontFamily = useFont();

  const nameFormatted = automaticallyCapitablizeFirstLetters
    ? capitalizeFirstLetterOfEveryWord(name)
    : name;

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
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        // calculate max width for the text container
        // 42 is for the arrow container (width + margins)
        setTextContainerMaxWidth(width - IMAGE_WRAPPER_SIZE - 42 - 30);
      }}
    >
      {imageUrl && (
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <GoldGradient />
            <ImageWrapper uri={imageUrl || ''} style={styles.image} />
          </View>
        </View>
      )}
      <TextWrapper
        style={[
          styles.itemTitle,
          { fontFamily: fontFamily.italic, maxWidth: textContainerMaxWidth },
        ]}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {nameFormatted}
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
    height: ITEM_HEIGHT,
    borderColor: BROWN_COLOR_4,
    alignSelf: 'flex-start',
  },
  itemTitle: {
    fontSize: 18,
    lineHeight: 36,
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
  imageContainer: {
    width: IMAGE_WRAPPER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE,
    overflow: 'hidden',
  },
  image: {
    width: IMAGE_SIZE - 2,
    height: IMAGE_SIZE - 2,
    margin: 1,
    borderRadius: IMAGE_SIZE,
  },
});

export default LinkItem;
