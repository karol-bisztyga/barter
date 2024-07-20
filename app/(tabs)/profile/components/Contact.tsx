import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { generateUserData } from '../../../mocks/userMocker';
import { UserData } from '../../../types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';

const Contact = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newUserData = generateUserData();
    setUserData(newUserData);

    const newEditing: Record<string, boolean> = {};
    Object.keys(newUserData || {}).forEach((k) => {
      console.log('loop', k, newUserData && newUserData[k as keyof UserData]);
      if (newUserData && newUserData[k as keyof UserData]) {
        newEditing[k] = false;
      }
    });
    setEditing(newEditing);
  }, []);

  useEffect(() => {
    console.log('user', userData);
    console.log('editing', editing);
  }, [editing, userData]);

  return (
    <View style={styles.container}>
      {userData &&
        Object.keys(userData).map((key, index) => {
          const value = userData && userData[key as keyof UserData];
          if (!value) {
            return null;
          }
          return (
            <View style={styles.constactItemWrapper} key={index}>
              <Text style={styles.constactItemTitle}>{key}</Text>
              <Text style={styles.constactItemValue}>{value}</Text>

              <TouchableOpacity
                style={styles.contactItemIconWrapper}
                activeOpacity={1}
                onPress={() => {
                  const newEditing = { ...editing };
                  newEditing[key] = true;
                  setEditing(newEditing);
                }}
              >
                <FontAwesome size={20} name="pencil" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItemIconWrapper}
                activeOpacity={1}
                onPress={async () => {
                  await Clipboard.setStringAsync(value);
                  Alert.alert('Copied to Clipboard', value);
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
