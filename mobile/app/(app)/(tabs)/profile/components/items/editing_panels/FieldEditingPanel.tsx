import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../../../types';
import { useUserContext } from '../../../../../context/UserContext';
import { useSessionContext } from '../../../../../../SessionContext';
import { updateUser } from '../../../../../db_utils/updateUser';
import { ErrorType, handleError } from '../../../../../utils/errorHandler';
import InputWrapper from '../../../../../genericComponents/InputWrapper';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import ButtonWrapper, { BUTTON_HEIGHT } from '../../../../../genericComponents/ButtonWrapper';
import { useJokerContext } from '../../../../../context/JokerContext';
import { EDITING_PANEL_HEIGHT, FILL_COLOR } from './constants';
import Background from '../../Background';

export type FieldEditingPanelProps = {
  name: string;
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
};

const FieldEditingPanel = ({
  name,
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setValue,
  setEditingId,
}: FieldEditingPanelProps) => {
  const sessionContext = useSessionContext();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, EDITING_PANEL_HEIGHT]),
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

      setEditingId('');
      jokerContext.showSuccess(`${name} updated`);
    } catch (e) {
      handleError(jokerContext, ErrorType.UPDATE_USER, `${e}`);
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
      <Background opacity={0.7} />
      <View style={styles.editingInputWrapper}>
        <InputWrapper
          style={styles.editingInput}
          placeholder="new value"
          value={editingValue}
          onChangeText={(text) => {
            setEditingValue(text);
          }}
          fillColor={FILL_COLOR}
        />
      </View>
      <View style={styles.updateButtonWrapper}>
        <ButtonWrapper
          title="Update"
          onPress={update}
          disabled={!validateValue()}
          fillColor={FILL_COLOR}
        />
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
    height: 52,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  editingInput: {},
  updateButtonWrapper: {
    flex: 1,
    marginVertical: 12,
    height: BUTTON_HEIGHT,
    marginRight: 4,
  },
});

export default FieldEditingPanel;
