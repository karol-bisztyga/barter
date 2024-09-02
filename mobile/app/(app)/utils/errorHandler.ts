import { showError } from './notifications';

export enum ErrorType {
  UNKNOWN_ERROR,
  SIGN_IN,
  REGISTER,
  READING_FROM_STORAGE,
  VERIFY,
  UNKNOWN_ROUTE,
  UPDATE_MATCHES,
  UPDATE_MATCH,
  CHAT_INITIALIZE,
  SOCKET,
  LOAD_MESSAGES,
  LOAD_MATCHES,
  ITEM_UNKNOWN,
  SEND_REPORT,
  UNMATCH_FAILED,
  UPLOAD_IMAGE,
  CAMERA,
  UPDATE_USER,
  CHANGE_PASSWORD,
  REMOVE_IMAGE,
  ADD_ITEM,
  UPDATE_ITEM,
  REMOVE_ITEM,
  LOAD_ITEMS,
  GET_LOCATION,
  SET_LOCATION,
  LOAD_CARDS,
  SEND_LIKE,
  CORRUPTED_SESSION,
  UPDATE_SESSION,
  SERVER_ERROR,
  NETWORK_ERROR,
  EMAIL_NOT_FOUND,
  SWIPE,
}

const getMessageForErrorType = (type: ErrorType) => {
  switch (type) {
    case ErrorType.SIGN_IN:
      return 'Error signing in';
    case ErrorType.REGISTER:
      return 'Error registering';
    case ErrorType.READING_FROM_STORAGE:
      return 'Error retreiving session';
    case ErrorType.VERIFY:
      return 'Verification failed';
    case ErrorType.UNKNOWN_ROUTE:
      return 'Unknown route';
    case ErrorType.UPDATE_MATCHES:
      return 'Error updating matches';
    case ErrorType.UPDATE_MATCH:
      return 'Error updating match';
    case ErrorType.CHAT_INITIALIZE:
      return 'Error initializing chat';
    case ErrorType.SOCKET:
      return 'Socket error';
    case ErrorType.LOAD_MESSAGES:
      return 'Error loading messages';
    case ErrorType.LOAD_MATCHES:
      return 'Error loading matches';
    case ErrorType.ITEM_UNKNOWN:
      return 'Unknown item';
    case ErrorType.SEND_REPORT:
      return 'Error sending report';
    case ErrorType.UNMATCH_FAILED:
      return 'Unmatch failed';
    case ErrorType.UPLOAD_IMAGE:
      return 'Upload image error';
    case ErrorType.CAMERA:
      return 'Camera error';
    case ErrorType.UPDATE_USER:
      return 'User update error';
    case ErrorType.CHANGE_PASSWORD:
      return 'Change password error';
    case ErrorType.REMOVE_IMAGE:
      return 'Remove image error';
    case ErrorType.ADD_ITEM:
      return 'Add item error';
    case ErrorType.UPDATE_ITEM:
      return 'Update item error';
    case ErrorType.REMOVE_ITEM:
      return 'Remove item error';
    case ErrorType.GET_LOCATION:
      return 'Get location error';
    case ErrorType.SET_LOCATION:
      return 'Set location error';
    case ErrorType.LOAD_ITEMS:
      return 'Load items error';
    case ErrorType.LOAD_CARDS:
      return 'Load cards error';
    case ErrorType.SEND_LIKE:
      return 'Send like error';
    case ErrorType.CORRUPTED_SESSION:
      return 'your session seems to be corrupted, you may want to restart the app or log in again';
    case ErrorType.UPDATE_SESSION:
      return 'Update session error';
    case ErrorType.SERVER_ERROR:
      return 'Server error';
    case ErrorType.NETWORK_ERROR:
      return 'Network error';
    case ErrorType.EMAIL_NOT_FOUND:
      return 'Email could not be found';
    case ErrorType.SWIPE:
      return 'Swipe error';
    default:
      return 'Unknown error';
  }
};

export const handleError = (
  type: ErrorType,
  fullError: string,
  customMessage: string = '',
  showToUser: boolean = true
) => {
  // todo here check these errors:
  // - network error
  // - invalid token
  /**
    // if (!`${e}`.includes('Invalid token')) {
    //   showError('Error removing item');
    // }
   */
  if (type !== ErrorType.NETWORK_ERROR && fullError.includes('Network request failed')) {
    handleError(ErrorType.NETWORK_ERROR, fullError, 'Network error', showToUser);
    return;
  }
  const message = customMessage ? customMessage : getMessageForErrorType(type);
  console.error(message, fullError);
  showToUser && showError(message);
};
