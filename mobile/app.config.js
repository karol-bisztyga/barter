export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: 'wymianka',
    slug: 'barter',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'com.bb.barter',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.bb.barter',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive_icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      package: 'com.bb.barter',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
        },
      ],
      [
        'expo-asset',
        {
          assets: ['./assets'],
        },
      ],
      'expo-secure-store',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow wymianka to access your camera',
          microphonePermission: 'Allow wymianka to access your microphone',
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow wymianka to use your location',
        },
      ],
      [
        'expo-font',
        {
          fonts: ['assets/fonts/Schoolbell.ttf', 'assets/fonts/MedievalSharp.ttf'],
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'f79bf452-3a9f-412a-96e0-ed837477e54e',
      },
      EXPO_PUBLIC_ENV_ID: process.env.EXPO_PUBLIC_ENV_ID,
      EXPO_PUBLIC_SERVER_HOST: process.env.EXPO_PUBLIC_SERVER_HOST,
      EXPO_PUBLIC_PORT: process.env.EXPO_PUBLIC_PORT,
      EXPO_PUBLIC_JWT_SECRET: process.env.EXPO_PUBLIC_JWT_SECRET,
      EXPO_PUBLIC_SERVER_PORT: process.env.EXPO_PUBLIC_SERVER_PORT,
      EXPO_PUBLIC_POSTGRESQL_CONTAINER_NAME: process.env.EXPO_PUBLIC_POSTGRESQL_CONTAINER_NAME,
      EXPO_PUBLIC_DB_CONNECTION_URL: process.env.EXPO_PUBLIC_DB_CONNECTION_URL,
      EXPO_PUBLIC_DB_USER: process.env.EXPO_PUBLIC_DB_USER,
      EXPO_PUBLIC_DB_PASSWORD: process.env.EXPO_PUBLIC_DB_PASSWORD,
      EXPO_PUBLIC_DB_NAME: process.env.EXPO_PUBLIC_DB_NAME,
      EXPO_PUBLIC_DB_HOST: process.env.EXPO_PUBLIC_DB_HOST,
      EXPO_PUBLIC_DB_PORT: process.env.EXPO_PUBLIC_DB_PORT,
      EXPO_PUBLIC_SQL_FILE: process.env.EXPO_PUBLIC_SQL_FILE,
      EXPO_PUBLIC_STORAGE_APP_KEY_ID: process.env.EXPO_PUBLIC_STORAGE_APP_KEY_ID,
      EXPO_PUBLIC_STORAGE_APP_KEY: process.env.EXPO_PUBLIC_STORAGE_APP_KEY,
      EXPO_PUBLIC_STORAGE_FILES_BASE_URL: process.env.EXPO_PUBLIC_STORAGE_FILES_BASE_URL,
      EXPO_PUBLIC_BUCKET_SUFFIX: process.env.EXPO_PUBLIC_BUCKET_SUFFIX,
      EXPO_PUBLIC_EMAIL_ADDRESS: process.env.EXPO_PUBLIC_EMAIL_ADDRESS,
      EXPO_PUBLIC_EMAIL_PASSWORD: process.env.EXPO_PUBLIC_EMAIL_PASSWORD,
      // only for local
      EXPO_PUBLIC_SERVER_HOST_IP: process.env.EXPO_PUBLIC_SERVER_HOST_IP,
    },
  },
});
