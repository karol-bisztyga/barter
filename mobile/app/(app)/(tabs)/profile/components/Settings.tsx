import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSessionContext } from '../../../../SessionContext';
import { router } from 'expo-router';
import EditableItem from './items/EditableItem';
import LinkItem from './items/LinkItem';
import ToggleItem from './items/ToggleItem';
import { MandolinIcon, TrumpetIcon } from '../../../utils/icons';
import { useSettingsContext } from '../../../context/SettingsContext';
import Background from '../../../components/Background';
import { SECTION_BACKGROUND } from './items/editing_panels/constants';
import { useTranslation } from 'react-i18next';
import { SelectConfig } from './items/editing_panels/SelectEditingPanel';
import { useJokerContext } from '../../../context/JokerContext';
import { LANGUAGES } from '../../../constants';
import { getIconForLanguage } from '../../../utils/reusableStuff';

const Settings = ({
  editingId,
  setEditingId,
}: {
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();

  const sessionContext = useSessionContext();
  const settingsContext = useSettingsContext();

  const languageSelectConfig: SelectConfig = {
    options: LANGUAGES.map((language) => {
      return {
        value: language,
        label: t(language),
        Icon: getIconForLanguage(language),
      };
    }),
    onSelect: (value) => {
      setEditingId('');
      if (value === 'language_ukrainian') {
        jokerContext.showNonBlockingInfo(t('profile_language_not_supported'));
        return false;
      }
      if (settingsContext.language === value) {
        return false;
      }

      settingsContext.setLanguage(value);
      return true;
    },
    valueFormatter: (value) => {
      return t(value);
    },
  };

  return (
    <View style={styles.container}>
      <Background tile="stone" />
      <ToggleItem
        id="settings-music"
        isLast={false}
        onPress={() => {
          settingsContext.setMusicOn(!settingsContext.musicOn);
          if (settingsContext.soundsOn) {
            settingsContext.playSound('click');
          }
        }}
        Icon={MandolinIcon}
        disabled={!settingsContext.musicOn}
      />
      <ToggleItem
        id="settings-sounds"
        isLast={false}
        onPress={() => {
          settingsContext.setSoundsOn(!settingsContext.soundsOn);
        }}
        Icon={TrumpetIcon}
        disabled={!settingsContext.soundsOn}
      />
      <EditableItem
        name={t('profile_change_language')}
        initialValue={settingsContext.language}
        id="settings-language"
        editable
        isLast={false}
        editingId={editingId}
        setEditingId={setEditingId}
        type="select"
        selectConfig={languageSelectConfig}
      />
      <EditableItem
        name={t('profile_change_password')}
        initialValue="***"
        id="settings-password"
        editable
        isLast={false}
        editingId={editingId}
        setEditingId={setEditingId}
        type="password"
      />

      <LinkItem
        name={t('profile_terms_and_conditions')}
        id="settings-terms-and-conditions"
        isLast={false}
        onPress={() => {
          router.push('profile/terms_and_conditions');
        }}
      />
      <LinkItem
        name={t('profile_credits')}
        id="settings-credits"
        isLast={false}
        onPress={() => {
          router.push('profile/credits');
        }}
      />
      <LinkItem
        name={t('sign_out')}
        id="settings-sign-out"
        isLast={false}
        onPress={() => {
          sessionContext.signOut();
        }}
      />
      <LinkItem
        name={t('profile_delete_account')}
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
