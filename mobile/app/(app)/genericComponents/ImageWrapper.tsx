import React from 'react';
import { Image, ImageProps, Platform } from 'react-native';

type MyImageProps = ImageProps & {
  uri: string;
};

const ImageWrapper = ({ uri, ...props }: MyImageProps) => {
  if (
    process.env.EXPO_PUBLIC_ENV_ID === 'LOCAL' &&
    Platform.OS === 'android' &&
    process.env.EXPO_PUBLIC_SERVER_HOST
  ) {
    uri = uri.replace('http://localhost', process.env.EXPO_PUBLIC_SERVER_HOST);
  }
  return <Image source={{ uri }} {...props} />;
};

export default ImageWrapper;
