import React from 'react';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSessionContext } from '../../../../SessionContext';
import { router } from 'expo-router';
import { showInfo } from '../../../utils/notifications';
import ButtonWrapper from '../../../genericComponents/ButtonWrapper';

type ActionType = {
  icon: keyof typeof FontAwesome.glyphMap;
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
        <ButtonWrapper
          key={index}
          title={action.label}
          icon={action.icon}
          onPress={action.onPress}
          color={action.color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default Actions;
