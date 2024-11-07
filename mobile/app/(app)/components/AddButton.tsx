import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ItemBorderRadius } from '../types';
import { AlchemyIcon } from '../utils/icons';
import TextWrapper from '../genericComponents/TextWrapper';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../constants';
import { useTranslation } from 'react-i18next';

const ICON_SIZE = 100;

const AddButton = ({
  onPress,
  borderRadius = ItemBorderRadius['up-only'],
}: {
  onPress: () => void;
  borderRadius?: ItemBorderRadius;
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.imageWrapper,
        {
          borderRadius: borderRadius === ItemBorderRadius['all'] ? 20 : 0,
          height: '75%',
        },
      ]}
      activeOpacity={1}
      onPress={onPress}
    >
      <TextWrapper style={styles.label}>{t('new_image')}</TextWrapper>
      <AlchemyIcon width={ICON_SIZE} height={ICON_SIZE} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    flex: 1,
    borderColor: SWIPE_BASE_BACKGROUND_COLOR,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: {
    fontSize: 35,
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default AddButton;
