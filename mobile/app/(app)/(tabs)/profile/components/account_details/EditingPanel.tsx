import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../../types';
import { useUserContext } from '../../../../context/UserContext';
import { useSessionContext } from '../../../../../SessionContext';
import { updateUser } from '../../../../db_utils/updateUser';
import { ErrorType, handleError } from '../../../../utils/errorHandler';
import InputWrapper from '../../../../genericComponents/InputWrapper';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import ButtonWrapper from '../../../../genericComponents/ButtonWrapper';
import { showSuccess } from '../../../../utils/notifications';

type EditingPanelProps = {
  name: string;
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const EditingPanel = ({
  name,
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setValue,
}: EditingPanelProps) => {
  const sessionContext = useSessionContext();
  const userContext = useUserContext();

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, 60]),
    };
  });

  useAnimatedReaction(
    () => editing.value,
    (value) => {
      if (value === 0) {
        runOnJS(setEditingValue)(initialValue);
      }
    }
  );

  const update = async () => {
    if (editingValue === initialValue) {
      return;
    }
    try {
      userContext.setBlockingLoading(true);
      await updateUser(sessionContext, [{ field: name, value: editingValue }]);

      const obj: Partial<UserData> = {};
      obj[name as keyof UserData] = editingValue;
      setValue(editingValue);
      userContext.setData({ ...userContext.data, ...obj } as UserData);

      editing.value = withTiming(0);
      showSuccess(`${name} updated`);
    } catch (e) {
      handleError(ErrorType.UPDATE_USER, `${e}`);
    } finally {
      userContext.setBlockingLoading(false);
    }
  };

  const validateValue = () => {
    if (!editingValue) {
      return false;
    }
    if (editingValue === initialValue) {
      return false;
    }
    if (['phone'].includes(name)) {
      if (isNaN(parseInt(editingValue))) {
        return false;
      }
    }
    return true;
  };

  return (
    <Animated.View style={[styles.container, wrapperAnimatedStyle]}>
      <View style={styles.editingInputWrapper}>
        <InputWrapper
          style={styles.editingInput}
          placeholder="new value"
          value={editingValue}
          onChangeText={(text) => {
            setEditingValue(text);
          }}
        />
      </View>
      <View style={styles.updateButtonWrapper}>
        <ButtonWrapper title="Update" onPress={update} disabled={!validateValue()} />
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
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 40,
  },
  updateButtonWrapper: {
    flex: 1,
  },
});

export default EditingPanel;
