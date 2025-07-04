import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { ItemData } from '../../../types';
import ImageWrapper from '../../../genericComponents/ImageWrapper';
import { useTranslation } from 'react-i18next';
import { useMatchContext } from '../../../context/MatchContext';
import { NotificationIndicator } from '../../swipe/components/NotificationIndicator';
import { BLACK_COLOR, GOLD_COLOR_1 } from '../../../constants';
import { hexToRgbaString } from '../../../utils/harmonicColors';
import { useFont } from '../../../hooks/useFont';
import Background from '../../../components/Background';
import { Separator } from './Separator';
import { GoldGradient } from '../../../genericComponents/gradients/GoldGradient';

const IMAGE_SIZE = 35;

export type ChatItemProps = {
  id: string;
  myItem: ItemData;
  theirItem: ItemData;
  registerRenderedListItem: (_: string) => void;
};

const ChatItem = ({ id, myItem, theirItem, registerRenderedListItem }: ChatItemProps) => {
  const { t } = useTranslation();

  const matchContext = useMatchContext();

  const fontFamily = useFont();

  const myItemImage = myItem.images[0];
  const theirItemImage = theirItem.images[0];

  const containsNotifications = matchContext.matchesWithNotificationsIds.includes(id);

  return (
    <View
      style={styles.container}
      key={id}
      onLayout={() => {
        registerRenderedListItem(id);
      }}
    >
      <View style={styles.wrapper}>
        <Background tile="paper" style={{ opacity: 0.8 }} />
        <View style={[styles.itemWrapper, styles.myItemWrapper]}>
          {myItemImage && (
            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <GoldGradient />
                <ImageWrapper uri={myItemImage} style={styles.image} />
              </View>
            </View>
          )}
          <TextWrapper
            style={[styles.itemTitle, { fontFamily: fontFamily.bold }]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {myItem.name}
          </TextWrapper>
          <TextWrapper
            style={[styles.itemOwnerWrapper, { lineHeight: 60 }]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {t('you')}
          </TextWrapper>
        </View>
        <Separator />
        <View style={[styles.itemWrapper, styles.theirItemWrapper]}>
          {theirItemImage && (
            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <GoldGradient />
                <ImageWrapper uri={theirItemImage} style={styles.image} />
              </View>
            </View>
          )}
          <TextWrapper
            style={[styles.itemTitle, { fontFamily: fontFamily.bold }]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {theirItem.name}
          </TextWrapper>
          <TextWrapper style={styles.itemOwnerWrapper} ellipsizeMode="tail" numberOfLines={1}>
            {theirItem.userName}
          </TextWrapper>
        </View>
      </View>
      {containsNotifications && <NotificationIndicator iconSize={30} mode="chat-list" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 9,
    backgroundColor: hexToRgbaString(GOLD_COLOR_1, 0.3),
    borderRadius: 4,
  },
  wrapper: {
    overflow: 'hidden',
    flex: 1,
    borderRadius: 4,
  },
  itemWrapper: {
    flexDirection: 'row',
  },
  myItemWrapper: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  theirItemWrapper: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  itemTitle: {
    flex: 5,
    fontSize: 16,
    lineHeight: 60,
    color: BLACK_COLOR,
  },
  itemOwnerWrapper: {
    flex: 2,
    fontSize: 12,
    textAlign: 'right',
    marginRight: 8,
    lineHeight: 60,
    color: BLACK_COLOR,
  },
  imageContainer: {
    justifyContent: 'center',
    marginHorizontal: 14,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE,
    overflow: 'hidden',
  },
  image: {
    margin: 1,
    width: IMAGE_SIZE - 2,
    height: IMAGE_SIZE - 2,
    borderRadius: IMAGE_SIZE,
  },
});

export default ChatItem;
