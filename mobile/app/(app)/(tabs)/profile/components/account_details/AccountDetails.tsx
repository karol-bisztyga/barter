import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../../types';
import { useUserContext } from '../../../../context/UserContext';
import { ErrorType, handleError } from '../../../../utils/errorHandler';
import AccountDetailsItem from './AccountDetailsItem';

const AccountDetails = () => {
  const userContext = useUserContext();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const data = { ...userContext.data };

  if (!data) {
    handleError(
      ErrorType.CORRUPTED_SESSION,
      'your session seems to be corrupted (personal data is missing), you may want to restart the app or log in again'
    );
    return null;
  }

  data.onboarded = '';

  delete data.id;
  delete data.profilePicture;
  delete data.userLocationCoordinates;
  delete data.verificationCode;

  return (
    <View style={styles.container}>
      {Object.keys(data).map((name, index) => {
        const value = data && data[name as keyof UserData];
        return (
          <AccountDetailsItem
            name={name}
            initialValue={value || ''}
            index={index}
            key={index}
            editable={name !== 'email'}
            itemsLength={Object.keys(data).length}
            editingIndex={editingIndex}
            setEditingIndex={setEditingIndex}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    marginRight: 16,
    marginLeft: 16,
    borderRadius: 16,
  },
});

export default AccountDetails;
