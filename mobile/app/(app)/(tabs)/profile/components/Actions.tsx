import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSessionContext } from '../../../../SessionContext';

const Actions = () => {
  const sessionContext = useSessionContext();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionWrapper}
        activeOpacity={1}
        onPress={() => {
          console.log('sign out');
          sessionContext.signOut();
        }}
      >
        <FontAwesome size={30} name="arrow-left" style={styles.icon} />
        <Text style={styles.actionLabel}>Sign out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionWrapper}
        activeOpacity={1}
        onPress={() => {
          console.log('delete account');
        }}
      >
        <FontAwesome size={30} name="trash" style={styles.icon} />
        <Text style={[styles.actionLabel, { color: 'red' }]}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  actionWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {},
  actionLabel: {
    margin: 5,
    lineHeight: 30,
    fontSize: 20,
    marginLeft: 20,
  },
});

export default Actions;
