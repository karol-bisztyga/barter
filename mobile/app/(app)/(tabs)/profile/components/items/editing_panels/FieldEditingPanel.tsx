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
import ButtonWrapper from '../../../../../genericComponents/ButtonWrapper';
import { useJokerContext } from '../../../../../context/JokerContext';
import { EDITING_PANEL_HEIGHT, SECTION_BACKGROUND } from './constants';
import { useTranslation } from 'react-i18next';
import { BLACK_COLOR, BROWN_COLOR_4 } from '../../../../../constants';
import { capitalizeFirstLetterOfEveryWord } from '../../../../../utils/reusableStuff';

export type FieldEditingPanelProps = {
  name: string;
  displayName: string;
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
};

const FieldEditingPanel = ({
  name,
  displayName,
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setValue,
  setEditingId,
}: FieldEditingPanelProps) => {
  const { t } = useTranslation();

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
      jokerContext.showSuccess(t('updated', { name: displayName }));
    } catch (e) {
      handleError(t, jokerContext, ErrorType.UPDATE_USER, `${e}`);
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
          placeholder={capitalizeFirstLetterOfEveryWord(t('profile_new_value'))}
          value={editingValue}
          onChangeText={(text) => {
            setEditingValue(text);
          }}
          fillColor={SECTION_BACKGROUND}
        />
      </View>
      <View style={styles.updateButtonWrapper}>
        <ButtonWrapper
          title={capitalizeFirstLetterOfEveryWord(t('save'))}
          onPress={update}
          disabled={!validateValue()}
          mode="red"
          frameMode="single"
          marginTop={12}
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
    borderColor: BROWN_COLOR_4,
    borderBottomWidth: 1,
  },
  editingInputWrapper: {
    flex: 3,
    height: 52,
    marginLeft: 20,
    marginRight: 10,
    marginTop: 16,
  },
  editingInput: {
    color: BLACK_COLOR,
    fontSize: 14,
    paddingVertical: 14,
  },
  updateButtonWrapper: {
    flex: 1,
    marginTop: 14,
    marginRight: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FieldEditingPanel;
