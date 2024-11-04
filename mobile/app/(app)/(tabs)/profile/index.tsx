import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { router } from 'expo-router';
import { EditImageType } from '../../types';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import Settings from './components/Settings';
import TextWrapper from '../../genericComponents/TextWrapper';
import AccountDetails from './components/AccountDetails';
import MyItems from './components/MyItems';
import { FeatherIcon } from '../../utils/icons';
import { useSoundContext } from '../../context/SoundContext';
import Background from '../../components/Background';
import ProfilePicture, { PROFILE_PICTURE_SIZE } from './components/ProfilePicture';

const { height } = Dimensions.get('window');

const PROFILE_PICTURE_WRAPPER_PADDING = 20;

export default function Profile() {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const userContext = useUserContext();
  const editItemContext = useEditItemContext();
  const soundContext = useSoundContext();

  const [editingId, setEditingId] = useState<string>('');
  const [editingIdInitialized, setEditingIdInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (editingIdInitialized) {
      soundContext.playSound('stone');
    } else {
      setEditingIdInitialized(true);
    }

    if (editingId && scrollViewRef.current) {
      const targetOffsetY = editingId.split('-').at(-1);
      if (!targetOffsetY) {
        return;
      }
      const targetOffsetYNumber = parseInt(targetOffsetY);
      if (isNaN(targetOffsetYNumber) || !targetOffsetYNumber) {
        return;
      }
      scrollViewRef.current.scrollToPosition(0, targetOffsetYNumber - height / 2 + 50, true);
    }
  }, [editingId]);

  return (
    <>
      <SafeAreaView>
        <View>
          <KeyboardAwareScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <View style={styles.profileImageWrapper}>
              <View style={styles.profileImageInnerWrapper}>
                <Background tile="stone" opacity={1} style={[styles.profileImageBackground]} />
                {userContext.data?.profilePicture && (
                  <ProfilePicture
                    onLoadEnd={() => {
                      setImageLoading(false);
                    }}
                    uri={userContext.data.profilePicture}
                  />
                )}
                {userContext.data?.profilePicture ? (
                  imageLoading && (
                    <View style={styles.profileImageLoader}>
                      <ActivityIndicator size="large" color="black" />
                    </View>
                  )
                ) : (
                  <View style={styles.noProfilePictureWrapper}>
                    <Background tile="stone" />
                    <TextWrapper style={styles.noProfilePictureLabel}>
                      No profile picture
                    </TextWrapper>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editProfileImageWrapper}
                  onPress={() => {
                    soundContext.playSound('click');
                    editItemContext.setImageType(EditImageType.profile);
                    router.push('profile/addPicture');
                  }}
                >
                  <FeatherIcon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.titleWrapper}>
              <TextWrapper style={styles.title}>Account Details</TextWrapper>
            </View>
            <AccountDetails editingId={editingId} setEditingId={setEditingId} />
            <View style={styles.titleWrapper}>
              <TextWrapper style={styles.title}>My Items</TextWrapper>
            </View>
            <MyItems />
            <View style={styles.titleWrapper}>
              <TextWrapper style={styles.title}>Settings</TextWrapper>
            </View>
            <Settings editingId={editingId} setEditingId={setEditingId} />
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  profileImageWrapper: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,

    elevation: 20,
  },
  profileImageInnerWrapper: {
    width: PROFILE_PICTURE_SIZE + PROFILE_PICTURE_WRAPPER_PADDING * 2,
    height: PROFILE_PICTURE_SIZE + PROFILE_PICTURE_WRAPPER_PADDING * 2,
    padding: PROFILE_PICTURE_WRAPPER_PADDING,
    borderRadius: PROFILE_PICTURE_SIZE,
  },
  profileImageBackground: {
    width: PROFILE_PICTURE_SIZE + PROFILE_PICTURE_WRAPPER_PADDING * 2,
    height: PROFILE_PICTURE_SIZE + PROFILE_PICTURE_WRAPPER_PADDING * 2,
    padding: PROFILE_PICTURE_WRAPPER_PADDING,
    borderRadius: PROFILE_PICTURE_SIZE,
    opacity: 0.3,
    overflow: 'hidden',
  },
  editProfileImageWrapper: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'white',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    margin: 16,
  },
  profileImageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    height: 70,
    margin: 16,
  },
  title: {
    flex: 1,
    fontSize: 30,
    lineHeight: 70,
    textAlign: 'left',
  },
  itemsWrapper: {
    height: 100,
    padding: 10,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  noProfilePictureWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, .05)',
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  noProfilePictureLabel: {
    fontSize: 20,
  },
});
