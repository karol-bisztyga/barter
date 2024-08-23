import { DropdownAlertType } from 'react-native-dropdownalert';
import { showAlert } from '../../_layout';
import { ALERTS_INTERVAL } from '../constants';

let lastMessage: {
  message: string;
  shown: number;
  type: DropdownAlertType | null;
} = {
  message: '',
  shown: 0,
  type: null,
};

const checkIfDuplicatedMessage = (message: string, alertType: DropdownAlertType) => {
  const now = Date.now();

  if (
    lastMessage.message === message &&
    lastMessage.type === alertType &&
    now - lastMessage.shown < ALERTS_INTERVAL
  ) {
    return true;
  }
  lastMessage = { message, shown: now, type: alertType };
  return false;
};

const showAlertWrapper = (message: string, alertType: DropdownAlertType) => {
  if (checkIfDuplicatedMessage(message, alertType)) {
    return;
  }
  showAlert({
    type: alertType,
    title: alertType.toString(),
    message,
    interval: ALERTS_INTERVAL,
  });
};

export const showInfo = (...args: Array<string | number | boolean>) => {
  showAlertWrapper(`${args.join(' ')}`, DropdownAlertType.Info);
};

export const showSuccess = (...args: Array<string | number | boolean>) => {
  showAlertWrapper(`${args.join(' ')}`, DropdownAlertType.Success);
};

export const showError = (...args: Array<string | number | boolean>) => {
  let message = `${args.join(' ')}`;
  if (message.includes('Invalid token')) {
    message = 'session expired';
  }
  showAlertWrapper(message, DropdownAlertType.Error);
};
