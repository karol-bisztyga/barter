import React from 'react';
import { Stack } from 'expo-router';
import { headerBackButtonOptions } from '../../utils/reusableStuff';
import { Alert } from 'react-native';
import { EditItemContextProvider, useEditItemContext } from '../../context/EditItemContext';
import { useAddPictureContext } from '../../context/AddPictureContext';
import { SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY } from '../../constants';
import Background from '../../components/Background';
import { useTranslation } from 'react-i18next';

export default function Wrapper() {
  return (
    <EditItemContextProvider>
      <Layout />
    </EditItemContextProvider>
  );
}

function Layout() {
  const { t } = useTranslation();

  const editItemContext = useEditItemContext();
  const addPictureContext = useAddPictureContext();

  return (
    <>
      <Background tile="sword" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
          contentStyle: { backgroundColor: SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY },
          animation: 'none',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: '' }} />
        <Stack.Screen
          name="edit_item"
          options={headerBackButtonOptions(async (): Promise<boolean> => {
            if (!editItemContext.edited) {
              return true;
            }
            const discard: boolean = await new Promise((resolve) => {
              Alert.alert(
                t('profile_discard_changes_question'),
                '',
                [
                  { text: t('profile_discard_changes_no'), onPress: () => resolve(false) },
                  {
                    text: t('profile_discard_changes_yes'),
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
        <Stack.Screen
          name="add_picture"
          options={headerBackButtonOptions(async () => {
            addPictureContext.setImage(null);
            return true;
          })}
        />
        <Stack.Screen name="camera" options={headerBackButtonOptions()} />
        <Stack.Screen name="delete_account" options={headerBackButtonOptions()} />
        <Stack.Screen name="terms_and_conditions" options={headerBackButtonOptions()} />
        <Stack.Screen name="credits" options={headerBackButtonOptions()} />
      </Stack>
    </>
  );
}
