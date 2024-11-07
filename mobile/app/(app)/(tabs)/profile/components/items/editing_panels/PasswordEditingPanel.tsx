import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useUserContext } from '../../../../../context/UserContext';
import { useSessionContext } from '../../../../../../SessionContext';
import { ErrorType, handleError } from '../../../../../utils/errorHandler';
import InputWrapper from '../../../../../genericComponents/InputWrapper';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import ButtonWrapper from '../../../../../genericComponents/ButtonWrapper';
import { validatePassword } from '../../../../../utils/validators';
import { changePassword } from '../../../../../db_utils/changePassword';
import { useJokerContext } from '../../../../../context/JokerContext';
import { EDITING_PANEL_HEIGHT, SECTION_BACKGROUND } from './constants';
import { useTranslation } from 'react-i18next';

const HEIGHT = EDITING_PANEL_HEIGHT * 2.5;

export type FieldEditingPanelProps = {
  editing: SharedValue<number>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
};

const FieldEditingPanel = ({ editing, setEditingId }: FieldEditingPanelProps) => {
  const { t } = useTranslation();

  const sessionContext = useSessionContext();
  const userContext = useUserContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const jokerContext = useJokerContext();

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, EDITING_PANEL_HEIGHT * 2.5]),
    };
  });

  useAnimatedReaction(
    () => editing.value,
    (value) => {
      if (value === 0) {
        runOnJS(setCurrentPassword)('');
        runOnJS(setNewPassword)('');
      }
    }
  );

  const handlePasswordChange = async () => {
    userContext.setBlockingLoading(true);
    try {
      await changePassword(sessionContext, currentPassword, newPassword);
      jokerContext.showSuccess('password changed');
      setEditingId('');
    } catch (e) {
      handleError(t, jokerContext, ErrorType.CHANGE_PASSWORD, `${e}`); // todo this alert hides behind the modal on ios
    }
    userContext.setBlockingLoading(false);
  };

  const validateValue = () => {
    if (!currentPassword || !newPassword) {
      return false;
    }
    if (currentPassword === newPassword) {
      return false;
    }
    if (!validatePassword(newPassword)) {
      return false;
    }
    return true;
  };

  return (
    <Animated.View style={[styles.container, wrapperAnimatedStyle]}>
      <View style={styles.editingInputWrapper}>
        <InputWrapper
          style={styles.editingInput}
          placeholder="old password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={true}
          fillColor={SECTION_BACKGROUND}
        />
        <InputWrapper
          style={styles.editingInput}
          placeholder="new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          fillColor={SECTION_BACKGROUND}
        />
        <View style={styles.updateButtonWrapper}>
          <ButtonWrapper
            title="Update"
            onPress={handlePasswordChange}
            disabled={!validateValue()}
            fillColor={SECTION_BACKGROUND}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: SECTION_BACKGROUND,
  },
  editingInputWrapper: {
    flex: 1,
    height: HEIGHT,
    gap: 8,
    flexDirection: 'column',
    margin: 8,
  },
  editingInput: {},
  updateButtonWrapper: {
    flex: 1,
  },
});

export default FieldEditingPanel;
