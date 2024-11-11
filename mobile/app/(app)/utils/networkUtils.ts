import { Platform } from 'react-native';
import {
  EXPO_PUBLIC_ENV_ID,
  EXPO_PUBLIC_SERVER_HOST,
  EXPO_PUBLIC_SERVER_HOST_IP,
  EXPO_PUBLIC_SERVER_PORT,
} from './envs';

export const getServerAddress = () => {
  if (EXPO_PUBLIC_ENV_ID === 'PROD') {
    return `${EXPO_PUBLIC_SERVER_HOST}`;
  }
  // for local env
  let host = EXPO_PUBLIC_SERVER_HOST;
  if (Platform.OS === 'android') {
    host = EXPO_PUBLIC_SERVER_HOST_IP;
  }
  return `${host}:${EXPO_PUBLIC_SERVER_PORT}`;
};
