import React from 'react';
import { Image, ImageProps, Platform } from 'react-native';

type MyImageProps = ImageProps & {
  uri: string;
};

const ImageWrapper = ({ uri, ...props }: MyImageProps) => {
  // @ts-expect-error env vars not recognized
  const { EXPO_PUBLIC_ENV_ID, EXPO_PUBLIC_SERVER_HOST_IP } = process.env;
  if (EXPO_PUBLIC_ENV_ID === 'LOCAL' && Platform.OS === 'android' && EXPO_PUBLIC_SERVER_HOST_IP) {
    uri = uri.replace('http://localhost', EXPO_PUBLIC_SERVER_HOST_IP);
  }
  return <Image source={{ uri }} {...props} />;
};

export default ImageWrapper;
