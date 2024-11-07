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
      <TextWrapper style={styles.label}>{t('profile_delete_account_label_1')}</TextWrapper>
      <TextWrapper style={styles.label}>{t('profile_delete_account_label_2')}</TextWrapper>
      <InputWrapper
        placeholder={t('delete')}
        value={value}
        onChangeText={setValue}
        style={styles.input}
        autoCapitalize="none"
        fillColor="white"
      />
      <ButtonWrapper
        title={t('delete')}
        disabled={value !== t('delete')}
        onPress={handleDelete}
        color="red"
        fillColor="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    margin: 5,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 40,
    margin: 10,
    textAlign: 'center',
  },
});
