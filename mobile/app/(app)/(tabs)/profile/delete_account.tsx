import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { authorizeUser } from '../../utils/reusableStuff';
import { showSuccess } from '../../utils/notifications';
import { router } from 'expo-router';
import { ErrorType, handleError } from '../../utils/errorHandler';
import { useUserContext } from '../../context/UserContext';
import { deleteAccount } from '../../db_utils/deleteAccount';

export default function DeleteAccount() {
  const sessionContext = authorizeUser();
  const userContext = useUserContext();

  const [value, setValue] = useState<string>('');

  const handleDelete = async () => {
    userContext.setBlockingLoading(true);
    router.back();
    try {
      await deleteAccount(sessionContext);
      sessionContext.signOut();
      showSuccess('Account deleted');
    } catch (e) {
      handleError(ErrorType.DELETE_ACCOUNT, `${e}`);
    } finally {
      userContext.setBlockingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>If you really want to remove this account</Text>
      <Text style={styles.label}>{`please type "delete" below`}</Text>
      <TextInput
        placeholder="delete"
        value={value}
        onChangeText={setValue}
        style={styles.input}
        autoCapitalize="none"
      />
      <Button title="Delete" disabled={value !== 'delete'} onPress={handleDelete} color="red" />
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
    width: '80%',
    textAlign: 'center',
  },
});
