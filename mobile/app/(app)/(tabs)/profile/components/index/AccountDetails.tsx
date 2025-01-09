import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../../types';
import { useUserContext } from '../../../../context/UserContext';
import { ErrorType, handleError } from '../../../../utils/errorHandler';
import LinkItem from '../items/LinkItem';
import { router } from 'expo-router';
import EditableItem, { EditingPanelType } from '../items/EditableItem';
import { useJokerContext } from '../../../../context/JokerContext';
import { useTranslation } from 'react-i18next';
import { TAB_BAR_BACKGROUND_COLOR } from '../../../../constants';

const AccountDetails = ({
  editingId,
  setEditingId,
}: {
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const data = { ...userContext.data };

  if (!data) {
    handleError(t, jokerContext, ErrorType.CORRUPTED_SESSION);
    return null;
  }

  data.onboarded = '';

  const coordinates = data.userLocationCoordinates;

  delete data.id;
  delete data.profilePicture;
  delete data.userLocationCoordinates;
  delete data.verificationCode;

  const getTranslationForName = (name: string) => {
    switch (name) {
      case 'email':
        return t('email');
      case 'name':
        return t('profile_name');
      case 'phone':
        return t('profile_phone');
      case 'userLocationCity':
        return t('profile_location');
      default:
        return name;
    }
  };

  return (
    <View style={styles.container}>
      {Object.keys(data).map((name, index) => {
        let value = data && data[name as keyof UserData];
        if (name === 'onboarded') {
          return (
            <LinkItem
              name={t('profile_replay_onboarding')}
              id={`${index}`}
              key={index}
              isLast={index === Object.keys(data).length - 1}
              onPress={() => {
                router.replace('onboarding');
              }}
            />
          );
        }

        let editingPanelType: EditingPanelType = 'field';
        if (name === 'userLocationCity') {
          editingPanelType = 'location';
          if (!value) {
            if (coordinates) {
              const valueSplit = coordinates.trim().split(',');
              if (
                valueSplit.at(0) &&
                valueSplit.at(1) &&
                valueSplit.at(0) !== 'null' &&
                valueSplit.at(1) !== 'null'
              ) {
                value = coordinates;
              }
            }
          }
        }
        return (
          <EditableItem
            name={name}
            displayName={getTranslationForName(name)}
            initialValue={value || ''}
            id={`account-${index}`}
            key={index}
            editable={name !== 'email'}
            isLast={index === Object.keys(data).length - 1}
            editingId={editingId}
            setEditingId={setEditingId}
            type={editingPanelType}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: TAB_BAR_BACKGROUND_COLOR,
    marginHorizontal: 20,
  },
});

export default AccountDetails;
