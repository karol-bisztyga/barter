import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { Alert } from 'react-native';
import { EditItemContextProvider, useEditItemContext } from '../../context/EditItemContext';

export default function Wrapper() {
  return (
    <EditItemContextProvider>
      <Layout />
    </EditItemContextProvider>
  );
}

function Layout() {
  const editItemContext = useEditItemContext();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: '' }} />
      <Stack.Screen
        name="editItem"
        options={headerBackButtonOptions(async (): Promise<boolean> => {
          if (!editItemContext.edited) {
            return true;
          }
          const discard: boolean = await new Promise((resolve) => {
            Alert.alert(
              'Do you want to discard unsaved changes?',
              '',
              [
                { text: 'Stay', onPress: () => resolve(false) },
                {
                  text: 'Discard',
                  onPress: () => resolve(true),
                  style: 'destructive',
                },
              ],
              { cancelable: false }
            );
          });
          if (discard) {
            editItemContext.setEdited(false);
          }
          return discard;
        })}
      />
      <Stack.Screen name="addPicture" options={headerBackButtonOptions()} />
      <Stack.Screen name="camera" options={headerBackButtonOptions()} />
      <Stack.Screen name="set_location" options={{ presentation: 'modal' }} />
      <Stack.Screen name="change_password" options={{ presentation: 'modal' }} />
      <Stack.Screen name="delete_account" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
