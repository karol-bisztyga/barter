import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { authorizeUser } from '../../utils/reusableStuff';
import { router } from 'expo-router';
import { ErrorType, handleError } from '../../utils/errorHandler';
import { useUserContext } from '../../context/UserContext';
import { deleteAccount } from '../../db_utils/deleteAccount';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';

export default function DeleteAccount() {
  const sessionContext = authorizeUser();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const [value, setValue] = useState<string>('');

  const handleDelete = async () => {
    userContext.setBlockingLoading(true);
    router.back();
    try {
      await deleteAccount(sessionContext);
      sessionContext.signOut();
      jokerContext.showSuccess('Account deleted');
    } catch (e) {
      handleError(jokerContext, ErrorType.DELETE_ACCOUNT, `${e}`);
    } finally {
      userContext.setBlockingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextWrapper style={styles.label}>If you really want to remove this account</TextWrapper>
      <TextWrapper style={styles.label}>{`please type "delete" below`}</TextWrapper>
      <InputWrapper
        placeholder="delete"
        value={value}
        onChangeText={setValue}
        style={styles.input}
        autoCapitalize="none"
        fillColor="white"
      />
      <ButtonWrapper
        title="Delete"
        disabled={value !== 'delete'}
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
