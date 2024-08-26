import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { StyleSheet, Text } from 'react-native';
import { showInfo } from '../../../utils/notifications';

const ChatRightHeaderMenu = () => {
  const unmatch = () => {
    showInfo('unmatch not implemented yet');
  };
  const report = () => {
    showInfo('report not implemented yet');
  };

  return (
    <>
      <Menu>
        <MenuTrigger>
          <FontAwesome size={28} name="ellipsis-h" />
        </MenuTrigger>
        <MenuOptions customStyles={{ optionsContainer: styles.optionsContainer }}>
          <MenuOption onSelect={unmatch} style={styles.menuItemWrapper}>
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
