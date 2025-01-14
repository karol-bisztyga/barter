import React from 'react';
import { Image, ImageProps, Platform, View } from 'react-native';
import { EXPO_PUBLIC_ENV_ID, EXPO_PUBLIC_SERVER_HOST_IP } from '../utils/envs';
import { hexToRgbaString } from '../utils/harmonicColors';
import { TAB_BAR_BACKGROUND_COLOR } from '../constants';

type MyImageProps = ImageProps & {
  uri: string;
};

const ImageWrapper = ({ uri, ...props }: MyImageProps) => {
  if (EXPO_PUBLIC_ENV_ID === 'LOCAL' && Platform.OS === 'android' && EXPO_PUBLIC_SERVER_HOST_IP) {
    uri = uri.replace('http://localhost', EXPO_PUBLIC_SERVER_HOST_IP);
  }
  const style = props.style || {};
  delete props.style;
  return (
    <View
      style={[
        { backgroundColor: hexToRgbaString(TAB_BAR_BACKGROUND_COLOR, 0.7) },
        style,
        { overflow: 'hidden' },
      ]}
    >
      <Image source={{ uri }} {...props} style={{ width: '100%', height: '100%' }} />
    </View>
  );
};

export default ImageWrapper;
