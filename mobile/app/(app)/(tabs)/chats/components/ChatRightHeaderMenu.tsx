import React from 'react';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useMatchContext } from '../../../context/MatchContext';
import { unmatch } from '../../../db_utils/unmatch';
import { useSessionContext } from '../../../../SessionContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { Flag2Icon, FlagIcon, SwordsShieldIcon } from '../../../utils/icons';
import { useJokerContext } from '../../../context/JokerContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { RemoveMatchData } from '../../../types';
import { useSocketContext } from '../../../context/SocketContext';
import { IconButtonWithoutEvents } from '../../../genericComponents/IconButtonWithoutEvents';
import { BLACK_COLOR, RED_COLOR } from '../../../constants';
import { GoldGradient } from '../../../genericComponents/gradients/GoldGradient';
import { LinearGradient } from 'expo-linear-gradient';
import { hexToRgbaString } from '../../../utils/harmonicColors';

const MENU_ICON_SIZE = 28;

const ChatRightHeaderMenu = () => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();
  const sessionContext = useSessionContext();
  const matchContext = useMatchContext();
  const settingsContext = useSettingsContext();
  const socketContext = useSocketContext();

  const unmatchHandler = async () => {
    try {
      settingsContext.playSound('click');
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
        const result: RemoveMatchData[] = await unmatch(
          sessionContext,
          matchContext.currentMatchId
        );
        if (result.length) {
          socketContext.sendRemoveMatch(result);
        }

        jokerContext.showSuccess(t('chats_unmatch_success'));
      }
    } catch (e) {
      handleError(t, jokerContext, ErrorType.UNMATCH_FAILED, `${e}`);
    } finally {
      matchContext.setUnmatching(false);
    }
  };
  const report = async () => {
    settingsContext.playSound('click');
    router.push('chats/send_report');
  };

  return (
    <>
      <Menu>
        <MenuTrigger
          onPress={() => {
            settingsContext.playSound('click');
          }}
        >
          <IconButtonWithoutEvents Icon={Flag2Icon} style={styles.iconButton} />
        </MenuTrigger>
        <MenuOptions customStyles={{ optionsContainer: styles.optionsContainer }}>
          <GoldGradient />
          <MenuOption onSelect={unmatchHandler} style={styles.menuItemContainer}>
            <LinearGradient
              colors={[BLACK_COLOR, hexToRgbaString(BLACK_COLOR, 0.6), BLACK_COLOR]}
              locations={[0, 0.47, 1]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.menuItemWrapper}>
              <FlagIcon
                width={MENU_ICON_SIZE}
                height={MENU_ICON_SIZE}
                style={styles.menuItemIcon}
              />
              <TextWrapper style={styles.menuItemLabel}>{t('chats_unmatch_title')}</TextWrapper>
            </View>
          </MenuOption>

          <MenuOption
            onSelect={report}
            style={[styles.menuItemContainer, styles.menuItemContainerLast]}
          >
            <LinearGradient
              colors={[RED_COLOR, hexToRgbaString(RED_COLOR, 0.6), RED_COLOR]}
              locations={[0, 0.47, 1]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.menuItemWrapper}>
              <SwordsShieldIcon
                width={MENU_ICON_SIZE}
                height={MENU_ICON_SIZE}
                style={styles.menuItemIcon}
              />
              <TextWrapper style={styles.menuItemLabel}>{t('chats_report_title')}</TextWrapper>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  optionsContainer: {},
  menuItemContainer: {
    margin: 1,
    marginBottom: 0,
    padding: 0,
  },
  menuItemContainerLast: {
    marginBottom: 1,
  },
  menuItemWrapper: {
    margin: 8,
    flexDirection: 'row',
  },
  menuItemIcon: {
    flex: 1,
    height: 30,
    lineHeight: 30,
    textAlign: 'center',
  },
  menuItemLabel: {
    height: 30,
    lineHeight: 30,
    marginLeft: 12,
    color: 'white',
  },
  iconButton: {
    marginTop: -8,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default ChatRightHeaderMenu;
