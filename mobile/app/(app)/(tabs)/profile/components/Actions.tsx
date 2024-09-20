import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSessionContext } from '../../../../SessionContext';
import { router } from 'expo-router';
import { showInfo } from '../../../utils/notifications';

type ActionType = {
  icon: 'arrow-left' | 'trash' | 'info' | 'language' | 'book';
  label: string;
  onPress: () => void;
  color?: string;
};

const Actions = () => {
  const sessionContext = useSessionContext();

  const deleteAccountHandler = async () => {
    router.push('profile/delete_account');
  };

  const actions: ActionType[] = [
    {
      icon: 'language',
      label: 'Change language',
      onPress: () => {
        showInfo('Change language not implemented yet...');
      },
    },
    {
      icon: 'book',
      label: 'Onboarding',
      onPress: () => {
        router.replace('onboarding');
      },
    },
    {
      icon: 'info',
      label: 'Terms and conditions',
      onPress: () => {
        router.push('profile/terms_and_conditions');
      },
    },
    {
      icon: 'arrow-left',
      label: 'Sign out',
      onPress: () => {
        sessionContext.signOut();
      },
    },
    {
      icon: 'trash',
      label: 'Delete Account',
      onPress: deleteAccountHandler,
      color: 'red',
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          style={styles.actionWrapper}
          activeOpacity={1}
          onPress={action.onPress}
          key={index}
        >
          <FontAwesome size={30} name={action.icon} style={styles.icon} />
          <Text style={[styles.actionLabel, { color: action.color || 'black' }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
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
  icon: {
    width: 30,
    textAlign: 'center',
  },
  actionLabel: {
    margin: 5,
    lineHeight: 30,
    fontSize: 20,
    marginLeft: 20,
  },
});

export default Actions;
