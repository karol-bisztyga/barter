import React from 'react';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMatchContext } from '../../../context/MatchContext';
import { unmatch } from '../../../db_utils/unmatch';
import { useSessionContext } from '../../../../SessionContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { Flag2Icon, FlagIcon, SwordsShieldIcon } from '../../../utils/icons';
import { useJokerContext } from '../../../context/JokerContext';
import { useSoundContext } from '../../../context/SoundContext';
import { useTranslation } from 'react-i18next';

const MENU_ICON_SIZE = 28;

const ChatRightHeaderMenu = () => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();
  const sessionContext = useSessionContext();
  const matchContext = useMatchContext();
  const soundContext = useSoundContext();

  const unmatchHandler = async () => {
    try {
      soundContext.playSound('click');
      const decision: boolean = await new Promise((resolve) => {
        Alert.alert(
          t('chats_unmatch_question_title'),
          '',
          [
            { text: t('chats_unmatch_question_no'), onPress: () => resolve(false) },
            {
              text: t('chats_unmatch_question_yes'),
              onPress: () => resolve(true),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
      });
      if (decision) {
        matchContext.setUnmatching(true);
        if (!matchContext.currentMatchId) {
          throw new Error('could not detemine current match');
        }
        await unmatch(sessionContext, matchContext.currentMatchId);
        matchContext.setMatches(
          matchContext.matches.filter((m) => m.id !== matchContext.currentMatchId)
        );

        jokerContext.showSuccess(t('chats_unmatch_success'));
        router.back();
      }
    } catch (e) {
      handleError(t, jokerContext, ErrorType.UNMATCH_FAILED, `${e}`);
    } finally {
      matchContext.setUnmatching(false);
    }
  };
  const report = async () => {
    soundContext.playSound('click');
    router.push('chats/send_report');
  };

  return (
    <>
      <Menu>
        <MenuTrigger
          onPress={() => {
            soundContext.playSound('click');
          }}
        >
          <Flag2Icon width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} />
        </MenuTrigger>
        <MenuOptions customStyles={{ optionsContainer: styles.optionsContainer }}>
          <MenuOption onSelect={unmatchHandler} style={styles.menuItemWrapper}>
            <FlagIcon width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} style={styles.menuItemIcon} />
            <TextWrapper style={styles.menuItemLabel}>{t('chats_unmatch_title')}</TextWrapper>
          </MenuOption>

          <MenuOption onSelect={report} style={styles.menuItemWrapper}>
            <SwordsShieldIcon
              width={MENU_ICON_SIZE}
              height={MENU_ICON_SIZE}
              style={styles.menuItemIcon}
            />
            <TextWrapper style={styles.menuItemLabel}>{t('chats_report_title')}</TextWrapper>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  optionsContainer: {
    borderRadius: 10,
  },
  menuItemWrapper: {
    flexDirection: 'row',
    padding: 5,
  },
  menuItemIcon: {
    flex: 1,
    height: 30,
    lineHeight: 30,
    textAlign: 'center',
  },
  menuItemLabel: {
    flex: 4,
    height: 30,
    lineHeight: 30,
    paddingLeft: 5,
  },
});

export default ChatRightHeaderMenu;
