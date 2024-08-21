import { DropdownAlertType } from 'react-native-dropdownalert';
import { showAlert } from '../../_layout';

export const showInfo = (...args: Array<string | number | boolean>) => {
  console.log(...args); // todo user showAlert
};

export const showWarning = (...args: Array<string | number | boolean>) => {
  console.warn(...args); // todo user showAlert
};

export const showError = (...args: Array<string | number | boolean>) => {
  let message = `${args.join(' ')}`;
  if (message.includes('Invalid token')) {
    message = 'session expired';
  }
  showAlert({
    type: DropdownAlertType.Error,
    title: 'Error',
    message,
  });
};
