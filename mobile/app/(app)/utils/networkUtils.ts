export const getServerAddress = () => {
  return process.env.EXPO_PUBLIC_ENV_ID === 'PROD'
    ? `${process.env.EXPO_PUBLIC_SERVER_HOST}`
    : `${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}`;
};
