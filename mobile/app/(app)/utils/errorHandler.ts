import { JokerContextState } from '../context/JokerContext';
import { TFunction } from 'i18next';

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
  SESSION_EXPIRED,
  DELETE_ACCOUNT,
  INVALID_TOKEN,
  UNAUTHORIZED_ACCESS,
  NO_FILE_NAME,
  NO_FILE_TYPE,
  FILE_TYPE_INVALID,
}

export const getMessageForErrorType = (t: TFunction, type: ErrorType) => {
  switch (type) {
    case ErrorType.SIGN_IN:
      return t('error_sign_in');
    case ErrorType.REGISTER:
      return t('error_register');
    case ErrorType.READING_FROM_STORAGE:
      return t('error_reading_from_storage');
    case ErrorType.VERIFY:
      return t('error_verify');
    case ErrorType.UNKNOWN_ROUTE:
      return t('error_unknown_route');
    case ErrorType.UPDATE_MATCHES:
      return t('error_update_matches');
    case ErrorType.UPDATE_MATCH:
      return t('error_update_match');
    case ErrorType.CHAT_INITIALIZE:
      return t('error_chat_initialize');
    case ErrorType.SOCKET:
      return t('error_socket');
    case ErrorType.LOAD_MESSAGES:
      return t('error_load_messages');
    case ErrorType.LOAD_MATCHES:
      return t('error_load_matches');
    case ErrorType.ITEM_UNKNOWN:
      return t('error_item_unknown');
    case ErrorType.SEND_REPORT:
      return t('error_send_report');
    case ErrorType.UNMATCH_FAILED:
      return t('error_unmatch_failed');
    case ErrorType.UPLOAD_IMAGE:
      return t('error_upload_image');
    case ErrorType.CAMERA:
      return t('error_camera');
    case ErrorType.UPDATE_USER:
      return t('error_update_user');
    case ErrorType.CHANGE_PASSWORD:
      return t('error_change_password');
    case ErrorType.REMOVE_IMAGE:
      return t('error_remove_image');
    case ErrorType.ADD_ITEM:
      return t('error_add_item');
    case ErrorType.UPDATE_ITEM:
      return t('error_update_item');
    case ErrorType.REMOVE_ITEM:
      return t('error_remove_item');
    case ErrorType.GET_LOCATION:
      return t('error_get_location');
    case ErrorType.SET_LOCATION:
      return t('error_set_location');
    case ErrorType.LOAD_ITEMS:
      return t('error_load_items');
    case ErrorType.LOAD_CARDS:
      return t('error_load_cards');
    case ErrorType.SEND_LIKE:
      return t('error_send_like');
    case ErrorType.CORRUPTED_SESSION:
      return t('error_corrupted_session');
    case ErrorType.UPDATE_SESSION:
      return t('error_update_session');
    case ErrorType.SERVER_ERROR:
      return t('error_server_error');
    case ErrorType.NETWORK_ERROR:
      return t('error_network_error');
    case ErrorType.EMAIL_NOT_FOUND:
      return t('error_email_not_found');
    case ErrorType.SWIPE:
      return t('error_swipe');
    case ErrorType.SESSION_EXPIRED:
      return t('error_session_expired');
    case ErrorType.DELETE_ACCOUNT:
      return t('error_delete_account');
    case ErrorType.INVALID_TOKEN:
      return t('error_invalid_token');
    case ErrorType.UNAUTHORIZED_ACCESS:
      return t('error_unauthorized_access');
    case ErrorType.NO_FILE_NAME:
      return t('error_no_file_name');
    case ErrorType.NO_FILE_TYPE:
      return t('error_no_file_type');
    case ErrorType.FILE_TYPE_INVALID:
      return t('error_file_type_invalid');
    default:
      return t('error_unknown');
  }
};

export const handleError = (
  t: TFunction,
  jokerContext: JokerContextState,
  type: ErrorType,
  fullError: string = '',
  customMessage: string = '',
  showToUser: boolean = true
): void => {
  if (type !== ErrorType.NETWORK_ERROR && fullError.includes('Network request failed')) {
    return handleError(
      t,
      jokerContext,
      ErrorType.NETWORK_ERROR,
      fullError,
      getMessageForErrorType(t, ErrorType.NETWORK_ERROR),
      showToUser
    );
  }
  if (type !== ErrorType.SESSION_EXPIRED && fullError.includes('Invalid token')) {
    return handleError(
      t,
      jokerContext,
      ErrorType.SESSION_EXPIRED,
      fullError,
      getMessageForErrorType(t, ErrorType.INVALID_TOKEN),
      showToUser
    );
  }
  const message = customMessage ? customMessage : getMessageForErrorType(t, type);
  console.error(message, fullError);
  showToUser && jokerContext.showError(message);
};
