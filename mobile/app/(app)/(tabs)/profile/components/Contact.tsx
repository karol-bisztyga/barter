import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../types';
import PersonalDataItem from './PersonalDataItem';
import { useUserContext } from '../../../context/UserContext';

const Contact = () => {
  const userContext = useUserContext();
  console.log('user data', userContext.data);

  return (
    <View style={styles.container}>
      {userContext.data &&
        Object.keys(userContext.data).map((name, index) => {
          const value = userContext.data && userContext.data[name as keyof UserData];
          return (
            <PersonalDataItem name={name} initialValue={value || ''} index={index} key={index} />
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default Contact;
