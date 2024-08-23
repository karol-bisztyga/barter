import validator from 'validator';

const PASSWORD_MINIMUM_LENGTH = 8;

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= PASSWORD_MINIMUM_LENGTH;
};
