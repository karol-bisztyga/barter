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
import { showSuccess } from '../../../../../utils/notifications';
import { validatePassword } from '../../../../../utils/validators';
import { changePassword } from '../../../../../db_utils/changePassword';

const HEIGHT = 170;

export type FieldEditingPanelProps = {
  editing: SharedValue<number>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
};

const FieldEditingPanel = ({ editing, setEditingId }: FieldEditingPanelProps) => {
  const sessionContext = useSessionContext();
  const userContext = useUserContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, HEIGHT]),
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
      showSuccess('password changed');
      setEditingId('');
    } catch (e) {
      handleError(ErrorType.CHANGE_PASSWORD, `${e}`); // todo this alert hides behind the modal on ios
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
          fillColor="#F5F5F5"
        />
        <InputWrapper
          style={styles.editingInput}
          placeholder="new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          fillColor="#F5F5F5"
        />
        <View style={styles.updateButtonWrapper}>
          <ButtonWrapper
            title="Update"
            onPress={handlePasswordChange}
            disabled={!validateValue()}
            fillColor="#F5F5F5"
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
  },
  editingInputWrapper: {
    flex: 1,
    height: HEIGHT,
    gap: 8,
    flexDirection: 'column',
  },
  editingInput: {},
  updateButtonWrapper: {
    flex: 1,
  },
});

export default FieldEditingPanel;
