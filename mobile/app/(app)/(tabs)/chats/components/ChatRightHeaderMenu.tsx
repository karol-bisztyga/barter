import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useMatchContext } from '../../../context/MatchContext';
import { unmatch } from '../../../db_utils/unmatch';
import { useSessionContext } from '../../../../SessionContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';

const ChatRightHeaderMenu = () => {
  const sessionContext = useSessionContext();
  const matchContext = useMatchContext();

  const unmatchHandler = async () => {
    try {
      const decision: boolean = await new Promise((resolve) => {
        Alert.alert(
          'Do you really want to unmatch these items?',
          '',
          [
            { text: 'Keep the match', onPress: () => resolve(false) },
            {
              text: 'Yes, unmatch them',
              onPress: () => resolve(true),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
      });
      if (decision) {
        matchContext.setUnmatching(true);
        console.log('unmatching...', matchContext.currentMatchId);
        if (!matchContext.currentMatchId) {
          throw new Error('could not detemine current match');
        }
        await unmatch(sessionContext, matchContext.currentMatchId);
        matchContext.setMatches(
          matchContext.matches.filter((m) => m.id !== matchContext.currentMatchId)
        );

        console.log('unmatched');
        router.back();
      }
    } catch (e) {
      handleError(ErrorType.UNMATCH_FAILED, `${e}`);
    } finally {
      matchContext.setUnmatching(false);
    }
  };
  const report = async () => {
    router.push('chats/send_report');
  };

  return (
    <>
      <Menu>
        <MenuTrigger>
          <FontAwesome size={28} name="ellipsis-h" />
        </MenuTrigger>
        <MenuOptions customStyles={{ optionsContainer: styles.optionsContainer }}>
          <MenuOption onSelect={unmatchHandler} style={styles.menuItemWrapper}>
            <FontAwesome size={28} style={styles.menuItemIcon} name="trash" />
            <Text style={styles.menuItemLabel}>Unmatch</Text>
          </MenuOption>

          <MenuOption onSelect={report} style={styles.menuItemWrapper}>
            <FontAwesome size={28} style={styles.menuItemIcon} name="exclamation" />
            <Text style={styles.menuItemLabel}>Report</Text>
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
