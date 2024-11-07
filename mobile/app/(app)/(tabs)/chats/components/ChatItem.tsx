import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { ItemData } from '../../../types';
import ImageWrapper from '../../../genericComponents/ImageWrapper';
import { ArrowsIcon } from '../../../utils/icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const ICON_SIZE = 16;

export type ChatItemProps = {
  id: string;
  myItem: ItemData;
  theirItem: ItemData;
  registerRenderedListItem: (_: string) => void;
};

const ChatItem = ({ id, myItem, theirItem, registerRenderedListItem }: ChatItemProps) => {
  const { t } = useTranslation();

  const myItemImage = myItem.images[0];
  const theirItemImage = theirItem.images[0];

  return (
    <View
      style={styles.container}
      key={id}
      onLayout={() => {
        registerRenderedListItem(`${myItem.id}-${theirItem.id}`);
      }}
    >
      <View style={[styles.itemWrapper, styles.myItemWrapper]}>
        {myItemImage && (
          <View style={styles.imageWrapper}>
            <ImageWrapper uri={myItemImage} style={styles.image} />
          </View>
        )}
        <TextWrapper style={styles.itemTitle} ellipsizeMode="tail" numberOfLines={1}>
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
      <View style={[styles.itemWrapper, styles.theirItemWrapper]}>
        {theirItemImage && (
          <View style={styles.imageWrapper}>
            <ImageWrapper uri={theirItemImage} style={styles.image} />
          </View>
        )}
        <TextWrapper style={styles.itemTitle} ellipsizeMode="tail" numberOfLines={1}>
          {theirItem.name}
        </TextWrapper>
        <TextWrapper style={styles.itemOwnerWrapper} ellipsizeMode="tail" numberOfLines={1}>
          {theirItem.userName}
        </TextWrapper>
      </View>
      <View style={styles.iconWrapper}>
        <ArrowsIcon width={ICON_SIZE} height={ICON_SIZE} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    margin: 16,
  },
  itemWrapper: {
    borderRadius: 16,
    flexDirection: 'row',
    height: 60,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
  },
  myItemWrapper: {
    borderColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  theirItemWrapper: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  itemTitle: {
    flex: 5,
    fontSize: 20,
    lineHeight: 60,
    marginLeft: 16,
  },
  itemOwnerWrapper: {
    flex: 2,
    fontSize: 16,
    textAlign: 'right',
    marginRight: 8,
    lineHeight: 60,
  },
  imageWrapper: {
    flex: 1,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  iconWrapper: {
    height: ICON_SIZE,
    width: ICON_SIZE,
    position: 'absolute',
    top: 120 / 2 - ICON_SIZE / 2,
    left: width / 2 - ICON_SIZE / 2,
  },
});

export default ChatItem;
