import React from 'react';
import { StyleSheet } from 'react-native';
import ImageWrapper from '../../../genericComponents/ImageWrapper';

export const PROFILE_PICTURE_SIZE = 200;

type ProfilePictureProps = {
  uri: string;
  onLoadEnd: () => void;
};

const ProfilePicture = ({ uri, onLoadEnd }: ProfilePictureProps) => {
  return <ImageWrapper style={styles.profileImage} uri={uri} onLoadEnd={onLoadEnd} />;
};

const styles = StyleSheet.create({
  profileImage: {
    width: PROFILE_PICTURE_SIZE,
    height: PROFILE_PICTURE_SIZE,
    borderRadius: PROFILE_PICTURE_SIZE,
  },
});

export default ProfilePicture;
