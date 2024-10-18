import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ImageWrapper from '../../../../genericComponents/ImageWrapper';
import TextWrapper from '../../../../genericComponents/TextWrapper';

export type LinkItemProps = {
  name: string;
  id: string;
  isLast: boolean;
  onPress: () => void;
  imageUrl?: string;
};

const LinkItem = ({ name, id, isLast, onPress, imageUrl }: LinkItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
      key={id}
      onPress={onPress}
    >
      {imageUrl && (
        <View style={styles.imageWrapper}>
          <ImageWrapper uri={imageUrl || ''} style={styles.image} />
        </View>
      )}
      <TextWrapper style={styles.itemTitle} ellipsizeMode="tail" numberOfLines={1}>
        {name}
      </TextWrapper>
      <View style={styles.itemArrowWrapper}>
        <FontAwesome size={18} style={styles.itemArrow} name="chevron-right" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  itemTitle: {
    flex: 5,
    fontSize: 26,
    lineHeight: 60,
    marginLeft: 16,
  },
  itemArrowWrapper: {
    flex: 1,
    textAlign: 'right',
    height: 60,
    lineHeight: 60,
    width: 16,
    marginRight: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemArrow: {
    width: 16,
    height: 16,
    textAlign: 'center',
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
