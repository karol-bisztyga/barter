import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../types';
import PersonalDataItem from './PersonalDataItem';
import { useUserContext } from '../../../context/UserContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';

const PersonalData = () => {
  const userContext = useUserContext();

  const data = { ...userContext.data };

  if (!data) {
    handleError(
      ErrorType.CORRUPTED_SESSION,
      'your session seems to be corrupted (personal data is missing), you may want to restart the app or log in again'
    );
    return null;
  }

  delete data.id;
  delete data.profilePicture;
  delete data.location;
  delete data.verificationCode;

  return (
    <View style={styles.container}>
      {Object.keys(data).map((name, index) => {
        const value = data && data[name as keyof UserData];
        return (
          <PersonalDataItem
            name={name}
            initialValue={value || ''}
            index={index}
            key={index}
            editable={name !== 'email'}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default PersonalData;
