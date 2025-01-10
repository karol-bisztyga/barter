import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ErrorType, handleError } from '../../utils/errorHandler';
import { useUserContext } from '../../context/UserContext';
import { deleteAccount } from '../../db_utils/deleteAccount';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../../constants';
import { hexToRgbaString } from '../../utils/harmonicColors';
import Background from '../../components/Background';

export default function DeleteAccount() {
  const { t } = useTranslation();

  const sessionContext = useAuth();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const [value, setValue] = useState<string>('');

  const handleDelete = async () => {
    userContext.setBlockingLoading(true);
    router.back();
    try {
      await deleteAccount(sessionContext);
      sessionContext.signOut();
      jokerContext.showSuccess(t('profile_account_deleted'));
    } catch (e) {
      handleError(t, jokerContext, ErrorType.DELETE_ACCOUNT, `${e}`);
    } finally {
      userContext.setBlockingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <View style={styles.labelsWrapper}>
        <TextWrapper style={styles.label}>{t('profile_delete_account_label_1')}</TextWrapper>
        <TextWrapper style={styles.label}>{t('profile_delete_account_label_2')}</TextWrapper>
      </View>
      <View style={styles.inputsWrapper}>
        <InputWrapper
          placeholder={t('delete')}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          fillColor={hexToRgbaString(SWIPE_BASE_BACKGROUND_COLOR, 0.4)}
        />
      </View>

      <View style={styles.buttonsWrapper}>
        <ButtonWrapper
          title={t('delete')}
          disabled={value !== t('delete')}
          onPress={handleDelete}
          mode="red"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  labelsWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputsWrapper: {
    padding: 10,
  },
  buttonsWrapper: {
    flex: 1,
    gap: 12,
    padding: 12,
  },
  label: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
});
