import validator from 'validator';
import { PASSWORD_MINIMUM_LENGTH } from '../constants';

export const validateEmail = (email: string): boolean => {
  if (!email) {
    return false;
  }
  return validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= PASSWORD_MINIMUM_LENGTH;
};

export const validatePasswords = (password: string, confirmPassword: string): boolean => {
  return validatePassword(password) && password === confirmPassword;
};
