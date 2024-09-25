import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { validatePassword, validatePasswords } from '../../utils/validators';
import { changePassword } from '../../db_utils/changePassword';
import { authorizeUser } from '../../utils/reusableStuff';
import { showSuccess } from '../../utils/notifications';
import { router } from 'expo-router';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';

const ERROR_MESSAGES = {
  PASSWORD: 'password invalid, it must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'passwords do not match',
};

export default function ChangePassword() {
  const sessionContext = authorizeUser();

  const [errors, setErrors] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const formValid = () => {
    if (!currentPassword || !newPassword || !newPasswordRepeat) {
      return false;
    }
    if (errors.length) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const newErrors = [];
    if (currentPassword && !validatePassword(currentPassword)) {
      newErrors.push('current ' + ERROR_MESSAGES.PASSWORD);
    }
    if (newPassword && !validatePassword(newPassword)) {
      newErrors.push('new ' + ERROR_MESSAGES.PASSWORD);
    }
    if (newPassword && newPasswordRepeat && !validatePasswords(newPassword, newPasswordRepeat)) {
      newErrors.push(ERROR_MESSAGES.PASSWORDS_NOT_MATCH);
    }
    setErrors(newErrors);
  }, [currentPassword, newPassword, newPasswordRepeat]);

  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      await changePassword(sessionContext, currentPassword, newPassword);
      showSuccess('password changed');
      router.back();
    } catch (e) {
      handleError(ErrorType.CHANGE_PASSWORD, `${e}`); // todo this alert hides behind the modal on ios
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={true}
      />
      <TextInput
        placeholder="new password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={true}
      />
      <TextInput
        placeholder="repeat new password"
        value={newPasswordRepeat}
        onChangeText={setNewPasswordRepeat}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={true}
      />
      {errors.length ? (
        <View style={styles.errorWrapper}>
          {errors.map((error) => {
            return (
              <Text key={error} style={styles.errorText}>
                {error}
              </Text>
            );
          })}
        </View>
      ) : null}
      <ButtonWrapper title="Submit" disabled={!formValid()} onPress={handlePasswordChange} />
      {loading && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsWrapper: {
    margin: 20,
  },
  label: {
    margin: 5,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 40,
    margin: 10,
    width: '80%',
  },
  errorWrapper: {
    opacity: 0.6,
    width: '100%',
    padding: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loaderWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
