import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageWrapper from '../../../genericComponents/ImageWrapper';
import { FeatherIcon } from '../../../utils/icons';
import { hexToRgbaString } from '../../../utils/harmonicColors';
import { BROWN_COLOR_3, GOLD_COLOR_1, GOLD_COLOR_2 } from '../../../constants';
import { convertFigmaShadowToReactNative } from '../../../utils/reusableStuff';
import { useUserContext } from '../../../context/UserContext';
import { useEditItemContext } from '../../../context/EditItemContext';
import { useSettingsContext } from '../../../context/SettingsContext';
import { router } from 'expo-router';
import { EditImageType } from '../../../types';
import { BrownGradient } from '../../../genericComponents/gradients/BrownGradient';

export const PROFILE_PICTURE_SIZE = 193;
const CHANGE_ICON_SIZE = 28;
const CHANGE_ICON_WRAPPER_SIZE = 47;

const ProfilePicture = () => {
  const userContext = useUserContext();
  const editItemContext = useEditItemContext();
  const settingsContext = useSettingsContext();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          {
            ...convertFigmaShadowToReactNative({
              x: 0,
              y: 8,
              blur: 12,
              color: '#000000',
              opacity: 0.45,
            }),
          },
        ]}
      >
        {userContext.data?.profilePicture && (
          <ImageWrapper style={styles.profileImage} uri={userContext.data.profilePicture} />
        )}
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => {
            settingsContext.playSound('click');
            editItemContext.setImageType(EditImageType.profile);
            router.push('profile/add_picture');
          }}
        >
          <BrownGradient style={styles.gradient} />
          <FeatherIcon width={CHANGE_ICON_SIZE} height={CHANGE_ICON_SIZE} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 147,
    marginBottom: 63,
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    width: PROFILE_PICTURE_SIZE,
    height: PROFILE_PICTURE_SIZE,
    borderRadius: PROFILE_PICTURE_SIZE,
    opacity: 0.85,
  },
  imageWrapper: {
    width: PROFILE_PICTURE_SIZE,
    height: PROFILE_PICTURE_SIZE,
    borderRadius: PROFILE_PICTURE_SIZE,
    backgroundColor: hexToRgbaString(BROWN_COLOR_3, 0.65),
    borderWidth: 1,
    borderColor: GOLD_COLOR_2,
  },
  iconWrapper: {
    position: 'absolute',
    width: CHANGE_ICON_WRAPPER_SIZE,
    height: CHANGE_ICON_WRAPPER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GOLD_COLOR_1,
    borderRadius: CHANGE_ICON_WRAPPER_SIZE,
    right: -4,
    bottom: -4,
  },
  gradient: {
    borderRadius: CHANGE_ICON_WRAPPER_SIZE,
  },
});

export default ProfilePicture;
