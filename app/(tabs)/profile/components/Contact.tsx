import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { generateUserData } from '../../../mocks/userMocker';
import { UserData } from '../../../types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Contact = () => {
  const userData: UserData = generateUserData();
  console.log('user', userData);

  return (
    <View style={styles.container}>
      {Object.keys(userData).map((key, index) => {
        if (!userData[key as keyof UserData]) {
          return null;
        }
        return (
          <View style={styles.constactItemWrapper} key={index}>
            <Text style={styles.constactItemTitle}>{key}</Text>
            <Text style={styles.constactItemValue}>{userData[key as keyof UserData]}</Text>

            <TouchableOpacity
              style={styles.contactItemIconWrapper}
              activeOpacity={1}
              onPress={() => {
                console.log('edit');
              }}
            >
              <FontAwesome size={20} name="pencil" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItemIconWrapper}
              activeOpacity={1}
              onPress={() => {
                console.log('copy');
              }}
            >
              <FontAwesome size={20} name="copy" />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  constactItemWrapper: {
    margin: 10,
    flexDirection: 'row',
  },
  constactItemTitle: {
    padding: 10,
    flex: 2,
  },
  constactItemValue: {
    padding: 10,
    flex: 5,
  },
  contactItemIconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Contact;
