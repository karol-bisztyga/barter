import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../types';
import { useUserContext } from '../../../context/UserContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import LinkItem from './items/LinkItem';
import { router } from 'expo-router';
import EditableItem, { EditingPanelType } from './items/EditableItem';
import { useJokerContext } from '../../../context/JokerContext';
import { SECTION_BACKGROUND } from './items/editing_panels/constants';
import { useTranslation } from 'react-i18next';

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
    handleError(
      t,
      jokerContext,
      ErrorType.CORRUPTED_SESSION,
      'your session seems to be corrupted (personal data is missing), you may want to restart the app or log in again'
    );
    return null;
  }

  data.onboarded = '';

  const coordinates = data.userLocationCoordinates;

  delete data.id;
  delete data.profilePicture;
  delete data.userLocationCoordinates;
  delete data.verificationCode;

  return (
    <View style={styles.container}>
      {Object.keys(data).map((name, index) => {
        let value = data && data[name as keyof UserData];
        if (name === 'onboarded') {
          return (
            <LinkItem
              name="replay onboarding"
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
            value = coordinates;
          }
        }
        return (
          <EditableItem
            name={name}
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
    backgroundColor: SECTION_BACKGROUND,
    marginRight: 16,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageStyle: {
    resizeMode: 'repeat',
    opacity: 0.5,
  },
});

export default AccountDetails;
