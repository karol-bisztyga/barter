import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { Alert } from 'react-native';
import { EditItemContextProvider, useEditItemContext } from '../../context/EditItemContext';
import { AddPictureContextProvider } from '../../context/AddPictureContext';
import { SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY } from '../../constants';
import Background from '../../components/Background';

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
    <AddPictureContextProvider>
      <Background tile="sword" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
          contentStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
          animation: 'none',
        }}
      >
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
        <Stack.Screen name="delete_account" options={headerBackButtonOptions()} />
        <Stack.Screen name="terms_and_conditions" options={headerBackButtonOptions()} />
        <Stack.Screen name="credits" options={headerBackButtonOptions()} />
      </Stack>
    </AddPictureContextProvider>
  );
}
