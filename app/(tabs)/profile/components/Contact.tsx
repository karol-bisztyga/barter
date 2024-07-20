import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { generateUserData } from '../../../mocks/userMocker';
import { UserData } from '../../../types';
import PersonalDataItem from './PersonalDataItem';

const Contact = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const newUserData = generateUserData();
    setUserData(newUserData);
  }, []);

  console.log('user data', userData);

  return (
    <View style={styles.container}>
      {userData &&
        Object.keys(userData).map((name, index) => {
          const value = userData && userData[name as keyof UserData];
          if (!value) {
            return null;
          }
          return <PersonalDataItem name={name} initialValue={value} index={index} key={index} />;
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default Contact;
