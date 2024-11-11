import React from 'react';
import { Image, ImageProps, Platform } from 'react-native';
import { EXPO_PUBLIC_ENV_ID, EXPO_PUBLIC_SERVER_HOST_IP } from '../utils/envs';

type MyImageProps = ImageProps & {
  uri: string;
};

const ImageWrapper = ({ uri, ...props }: MyImageProps) => {
  if (EXPO_PUBLIC_ENV_ID === 'LOCAL' && Platform.OS === 'android' && EXPO_PUBLIC_SERVER_HOST_IP) {
    uri = uri.replace('http://localhost', EXPO_PUBLIC_SERVER_HOST_IP);
  }
  return <Image source={{ uri }} {...props} />;
};

export default ImageWrapper;
