import React from 'react';
import { StyleSheet, View } from 'react-native';
import ButtonWrapper from '../../../../genericComponents/ButtonWrapper';
import { capitalizeFirstLetterOfEveryWord } from '../../../../utils/reusableStuff';
import { useTranslation } from 'react-i18next';

type BottomButtonsProps = {
  addImage: () => void;
  removeImage: () => void;

  addImageDisabled: boolean;
};

export const BottomButtons = ({ addImage, removeImage, addImageDisabled }: BottomButtonsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.innerWrapper}>
        <View style={styles.buttonWrapper}>
          <ButtonWrapper
            mode="black"
            onPress={addImage}
            title={capitalizeFirstLetterOfEveryWord(t('add_new_image'))}
            disabled={addImageDisabled}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <ButtonWrapper
            mode="red"
            onPress={removeImage}
            title={capitalizeFirstLetterOfEveryWord(t('profile_remove_item_title'))}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 20,
  },
  innerWrapper: {
    marginHorizontal: 20,
  },
  buttonWrapper: {
    marginVertical: 10,
  },
});
