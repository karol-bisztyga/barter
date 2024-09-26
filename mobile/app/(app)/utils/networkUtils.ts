import { Platform } from 'react-native';

export const getServerAddress = () => {
  if (process.env.EXPO_PUBLIC_ENV_ID === 'PROD') {
    return `${process.env.EXPO_PUBLIC_SERVER_HOST}`;
  }
  // for local env
  let host = process.env.EXPO_PUBLIC_SERVER_HOST;
  if (Platform.OS === 'android') {
    host = process.env.EXPO_PUBLIC_SERVER_HOST_IP;
  }
  return `${host}:${process.env.EXPO_PUBLIC_SERVER_PORT}`;
};
