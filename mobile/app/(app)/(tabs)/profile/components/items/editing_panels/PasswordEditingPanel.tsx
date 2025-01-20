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
import { BLACK_COLOR, BROWN_COLOR_4 } from '../../../../../constants';
import { capitalizeFirstLetterOfEveryWord } from '../../../../../utils/reusableStuff';

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
      jokerContext.showSuccess(t('profile_password_changed'));
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
          placeholder={capitalizeFirstLetterOfEveryWord(t('profile_old_password'))}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={true}
          fillColor={SECTION_BACKGROUND}
        />
        <InputWrapper
          style={styles.editingInput}
          placeholder={capitalizeFirstLetterOfEveryWord(t('profile_new_password'))}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          fillColor={SECTION_BACKGROUND}
        />
        <View style={styles.updateButtonWrapper}>
          <ButtonWrapper
            title={capitalizeFirstLetterOfEveryWord(t('update'))}
            onPress={handlePasswordChange}
            disabled={!validateValue()}
            mode="black"
            frameMode="single"
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
    borderColor: BROWN_COLOR_4,
    borderBottomWidth: 1,
  },
  editingInputWrapper: {
    flex: 3,
    height: 52,
    marginLeft: 20,
    marginRight: 10,
    marginTop: 16,
    gap: 12,
  },
  editingInput: {
    color: BLACK_COLOR,
    fontSize: 14,
    paddingVertical: 14,
  },
  updateButtonWrapper: {
    flex: 1,
  },
});

export default FieldEditingPanel;
