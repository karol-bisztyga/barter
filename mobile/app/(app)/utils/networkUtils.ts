import { Platform } from 'react-native';

export const getServerAddress = () => {
  // @ts-expect-error env vars not recognized
  const { EXPO_PUBLIC_ENV_ID, EXPO_PUBLIC_SERVER_HOST } = process.env;
  // @ts-expect-error env vars not recognized
  const { EXPO_PUBLIC_SERVER_HOST_IP, EXPO_PUBLIC_SERVER_PORT } = process.env;

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
