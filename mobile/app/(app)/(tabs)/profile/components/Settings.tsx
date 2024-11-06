import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSessionContext } from '../../../../SessionContext';
import { router } from 'expo-router';
import EditableItem from './items/EditableItem';
import LinkItem from './items/LinkItem';
import ToggleItem from './items/ToggleItem';
import { MandolinIcon, TrumpetIcon } from '../../../utils/icons';
import { useSoundContext } from '../../../context/SoundContext';
import Background from '../../../components/Background';
import { SECTION_BACKGROUND } from './items/editing_panels/constants';

const Settings = ({
  editingId,
  setEditingId,
}: {
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const sessionContext = useSessionContext();
  const soundContext = useSoundContext();

  return (
    <View style={styles.container}>
      <Background tile="stone" />
      <ToggleItem
        id="settings-music"
        isLast={false}
        onPress={() => {
          soundContext.setMusicOn(!soundContext.musicOn);
          if (soundContext.soundsOn) {
            soundContext.playSound('click');
          }
        }}
        Icon={MandolinIcon}
        disabled={!soundContext.musicOn}
      />
      <ToggleItem
        id="settings-sounds"
        isLast={false}
        onPress={() => {
          soundContext.setSoundsOn(!soundContext.soundsOn);
        }}
        Icon={TrumpetIcon}
        disabled={!soundContext.soundsOn}
      />
      <EditableItem
        name="change language"
        initialValue="English"
        id="settings-language"
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
        id="settings-password"
        editable
        isLast={false}
        editingId={editingId}
        setEditingId={setEditingId}
        type="password"
      />

      <LinkItem
        name="terms and conditions"
        id="settings-terms-and-conditions"
        isLast={false}
        onPress={() => {
          router.push('profile/terms_and_conditions');
        }}
      />
      <LinkItem
        name="credits"
        id="settings-credits"
        isLast={false}
        onPress={() => {
          router.push('profile/credits');
        }}
      />
      <LinkItem
        name="sign out"
        id="settings-sign-out"
        isLast={false}
        onPress={() => {
          sessionContext.signOut();
        }}
      />
      <LinkItem
        name="delete account"
        id="settings-delete-account"
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
    backgroundColor: SECTION_BACKGROUND,
    marginRight: 16,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default Settings;
