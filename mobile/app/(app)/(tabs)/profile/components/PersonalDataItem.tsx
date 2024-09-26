import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { UserData } from '../../../types';
import { useUserContext } from '../../../context/UserContext';
import { useSessionContext } from '../../../../SessionContext';
import { updateUser } from '../../../db_utils/updateUser';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import InputWrapper from '../../../genericComponents/InputWrapper';

const validateValue = (/*value: string*/) => {
  // todo handle this
  // if (!value) {
  //   return false;
  // }
  return true;
};

const StandardTools = ({
  value,
  setEditing,
  editable,
}: {
  value: string;
  setEditing: (_: boolean) => void;
  editable: boolean;
}) => {
  return (
    <>
      {editable ? (
        <TouchableOpacity
          style={styles.contactItemIconWrapper}
          activeOpacity={1}
          onPress={() => {
            setEditing(true);
          }}
        >
          <FontAwesome size={20} name="pencil" />
        </TouchableOpacity>
      ) : (
        <View style={styles.contactItemIconWrapper} />
      )}
      <TouchableOpacity
        style={styles.contactItemIconWrapper}
        activeOpacity={1}
        onPress={async () => {
          await Clipboard.setStringAsync(value);
          Alert.alert('Copied to Clipboard', value);
        }}
      >
        <FontAwesome size={20} name="copy" />
      </TouchableOpacity>
    </>
  );
};

const EditingTools = ({
  name,
  value,
  editingValue,
  setValue,
  setEditing,
}: {
  name: string;
  value: string;
  editingValue: string;
  setValue: (_: string) => void;
  setEditing: (_: boolean) => void;
}) => {
  const sessionContext = useSessionContext();
  return (
    <>
      <TouchableOpacity
        style={styles.contactItemIconWrapper}
        activeOpacity={1}
        onPress={async () => {
          // todo validation
          if (!validateValue()) {
            return;
          }
          if (value === editingValue) {
            setEditing(false);
            return;
          }
          try {
            const updateDatabaseResult = await updateUser(sessionContext, name, editingValue);
            setEditing(false);
            setValue(updateDatabaseResult[name]);
          } catch (e) {
            handleError(ErrorType.UPDATE_USER, `${e}`);
          }
        }}
      >
        <FontAwesome size={20} name="check" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.contactItemIconWrapper}
        activeOpacity={1}
        onPress={async () => {
          setEditing(false);
        }}
      >
        <FontAwesome size={20} name="ban" />
      </TouchableOpacity>
    </>
  );
};

const PersonalDataItem = ({
  name,
  initialValue,
  index,
  editable = true,
}: {
  name: string;
  initialValue: string;
  index: number;
  editable: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [editingValue, setEditingValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const userContext = useUserContext();

  const setValueWrapper = (newValue: string) => {
    const obj: Partial<UserData> = {};
    obj[name as keyof UserData] = newValue;
    setValue(newValue);
    userContext.setData({ ...userContext.data, ...obj } as UserData);
  };

  useEffect(() => {
    if (editing) {
      setEditingValue(value);
      inputRef.current?.focus();
    }
  }, [editing]);

  return (
    <View style={styles.container} key={index}>
      <Text style={styles.constactItemTitle}>{name}</Text>
      {editing ? (
        <InputWrapper
          ref={inputRef}
          value={editingValue}
          onChangeText={setEditingValue}
          style={[styles.constactItemValue, styles.editingTextInput]}
        />
      ) : (
        <Text
          style={[
            styles.constactItemValue,
            {
              backgroundColor: value ? 'transparent' : 'gray',
            },
          ]}
        >
          {value}
        </Text>
      )}
      {editing ? (
        <EditingTools
          name={name}
          editingValue={editingValue}
          value={value}
          setValue={setValueWrapper}
          setEditing={setEditing}
        />
      ) : (
        <StandardTools value={value} setEditing={setEditing} editable={editable} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flexDirection: 'row',
  },
  constactItemTitle: {
    padding: 10,
    flex: 2,
  },
  constactItemValue: {
    padding: 10,
    flex: 5,
  },
  editingTextInput: {
    backgroundColor: '#bdbda9',
  },
  contactItemIconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PersonalDataItem;
