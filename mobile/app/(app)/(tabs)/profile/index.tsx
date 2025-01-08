import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Settings from './components/Settings';
import TextWrapper from '../../genericComponents/TextWrapper';
import AccountDetails from './components/AccountDetails';
import MyItems from './components/MyItems';
import { useSettingsContext } from '../../context/SettingsContext';
import Background from '../../components/Background';
import ProfilePicture from './components/ProfilePicture';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetterOfEveryWord } from '../../utils/reusableStuff';

const { height } = Dimensions.get('window');

export default function Profile() {
  const { t } = useTranslation();

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const settingsContext = useSettingsContext();

  const [editingId, setEditingId] = useState<string>('');
  const [editingIdInitialized, setEditingIdInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (editingIdInitialized) {
      settingsContext.playSound('stone');
    } else {
      setEditingIdInitialized(true);
    }

    if (editingId && scrollViewRef.current) {
      const targetOffsetY = editingId.split('-').at(-1);
      if (!targetOffsetY) {
        return;
      }
      const targetOffsetYNumber = parseInt(targetOffsetY);
      if (isNaN(targetOffsetYNumber) || !targetOffsetYNumber) {
        return;
      }
      const position = targetOffsetYNumber - height / 2 + 50;
      if (position >= 0) {
        scrollViewRef.current.scrollToPosition(0, position, true);
      }
    }
  }, [editingId]);

  return (
    <View style={{}}>
      <Background tile="main" />
      <KeyboardAwareScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <ProfilePicture />
        <View style={styles.titleWrapper}>
          <TextWrapper style={styles.title}>
            {capitalizeFirstLetterOfEveryWord(t('profile_account_details'))}
          </TextWrapper>
        </View>
        <AccountDetails editingId={editingId} setEditingId={setEditingId} />
        <View style={styles.titleWrapper}>
          <TextWrapper style={styles.title}>
            {capitalizeFirstLetterOfEveryWord(t('profile_my_items'))}
          </TextWrapper>
        </View>
        <MyItems />
        <View style={styles.titleWrapper}>
          <TextWrapper style={styles.title}>
            {capitalizeFirstLetterOfEveryWord(t('profile_settings'))}
          </TextWrapper>
        </View>
        <Settings editingId={editingId} setEditingId={setEditingId} />
        <View style={styles.bottomSpace} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrapper: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  title: {
    fontSize: 22,
    lineHeight: 32,
    textAlign: 'left',
  },
  bottomSpace: {
    height: 20,
  },
});
