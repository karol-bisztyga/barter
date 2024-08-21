import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../types';
import PersonalDataItem from './PersonalDataItem';
import { useUserContext } from '../../../context/UserContext';
import { showError } from '../../../utils/notifications';

const PersonalData = () => {
  const userContext = useUserContext();

  const data = { ...userContext.data };

  if (!data) {
    showError('personal data is missing');
    return null;
  }

  delete data.id;
  delete data.profilePicture;
  delete data.location;

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
