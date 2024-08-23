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

  console.log(message, `last message: ${lastMessage}`);
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

export const showInfo = (...args: Array<string | number | boolean>) => {
  const alertType = DropdownAlertType.Info;
  const message = `${args.join(' ')}`;
  if (checkIfDuplicatedMessage(message, alertType)) {
    return;
  }

  showAlert({
    type: alertType,
    title: 'Info',
    message,
    interval: ALERTS_INTERVAL,
  });
};

export const showWarning = (...args: Array<string | number | boolean>) => {
  console.warn(...args); // todo user showAlert
};

export const showError = (...args: Array<string | number | boolean>) => {
  const alertType = DropdownAlertType.Error;
  let message = `${args.join(' ')}`;
  if (message.includes('Invalid token')) {
    message = 'session expired';
  }
  if (checkIfDuplicatedMessage(message, alertType)) {
    return;
  }
  showAlert({
    type: DropdownAlertType.Error,
    title: 'Error',
    message,
    interval: ALERTS_INTERVAL,
  });
};
