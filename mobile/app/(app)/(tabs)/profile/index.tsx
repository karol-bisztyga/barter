import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { EditImageType } from '../../types';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import Settings from './components/Settings';
import ImageWrapper from '../../genericComponents/ImageWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import AccountDetails from './components/account_details/AccountDetails';
import MyItems from './components/MyItems';

const { height } = Dimensions.get('window');

export default function Profile() {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const userContext = useUserContext();
  const editItemContext = useEditItemContext();

  const [editingId, setEditingId] = useState<string>('');

  useEffect(() => {
    if (editingId && scrollViewRef.current) {
      const targetOffsetY = editingId.split('-').at(-1);
      if (!targetOffsetY) {
        return;
      }
      const targetOffsetYNumber = parseInt(targetOffsetY);
      if (isNaN(targetOffsetYNumber) || !targetOffsetYNumber) {
        return;
      }
      scrollViewRef.current.scrollToPosition(0, targetOffsetYNumber - height / 2, true);
    }
  }, [editingId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImageInnerWrapper}>
              {userContext.data?.profilePicture && (
                <ImageWrapper
                  style={styles.profileImage}
                  uri={userContext.data.profilePicture}
                  onLoadEnd={() => {
                    setImageLoading(false);
                  }}
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
                  <TextWrapper style={styles.noProfilePictureLabel}>No profile picture</TextWrapper>
                </View>
              )}
              <TouchableOpacity
                style={styles.editProfileImageWrapper}
                activeOpacity={1}
                onPress={() => {
                  editItemContext.setImageType(EditImageType.profile);
                  router.push('profile/addPicture');
                }}
              >
                <FontAwesome size={20} name="pencil" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileImageWrapper: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,

    elevation: 20,
  },
  profileImageInnerWrapper: {
    width: 200,
    height: 200,
  },
  editProfileImageWrapper: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'white',
    bottom: 0,
    right: 0,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    margin: 16,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 200,
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
  },
  noProfilePictureLabel: {},
});
