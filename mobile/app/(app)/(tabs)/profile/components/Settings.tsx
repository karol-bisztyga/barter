import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSessionContext } from '../../../../SessionContext';
import { router } from 'expo-router';
import EditableItem from './items/EditableItem';
import LinkItem from './items/LinkItem';

const Settings = ({
  editingId,
  setEditingId,
}: {
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const sessionContext = useSessionContext();

  return (
    <View style={styles.container}>
      <EditableItem
        name="change language"
        initialValue="English"
        id="language"
        key={0}
        editable
        isLast={false}
        editingId={editingId}
        setEditingId={setEditingId}
        type="select"
        options={['English', 'Polish', 'Ukrainian']}
      />
      <EditableItem
        name="change password"
        initialValue="***"
        id="password"
        key={1}
        editable
        isLast={false}
        editingId={editingId}
        setEditingId={setEditingId}
        type="password"
      />

      <LinkItem
        name="terms and conditions"
        index={2}
        key={2}
        isLast={false}
        onPress={() => {
          router.push('profile/terms_and_conditions');
        }}
      />
      <LinkItem
        name="sign out"
        index={3}
        key={3}
        isLast={false}
        onPress={() => {
          sessionContext.signOut();
        }}
      />
      <LinkItem
        name="delete account"
        index={4}
        key={4}
        isLast={true}
        onPress={() => {
          router.push('profile/delete_account');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    marginRight: 16,
    marginLeft: 16,
    borderRadius: 16,
  },
});

export default Settings;
