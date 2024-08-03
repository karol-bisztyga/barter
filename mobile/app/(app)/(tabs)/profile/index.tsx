import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Separator from '../../components/Separator';
import Items from './components/Items';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { EditImageType } from '../../types';
import { useUserContext } from '../../context/UserContext';
import { useEditItemContext } from '../../context/EditItemContext';
import Actions from './components/Actions';
import PersonalData from './components/PersonalData';

export default function Profile() {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const scrollViewRef = useRef(null);
  const userContext = useUserContext();
  const editItemContext = useEditItemContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView ref={scrollViewRef}>
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImageInnerWrapper}>
              {userContext.data?.profilePicture && (
                <Image
                  style={styles.profileImage}
                  source={{ uri: userContext.data.profilePicture }}
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
                  <Text style={styles.noProfilePictureLabel}>No profile picture</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.editProfileImageWrapper}
                activeOpacity={1}
                onPress={() => {
                  console.log('edit profile picture');
                  editItemContext.setImageType(EditImageType.profile);
                  router.push('profile/addPicture');
                }}
              >
                <FontAwesome size={20} name="pencil" />
              </TouchableOpacity>
            </View>
          </View>
          <Separator style={styles.separator} />
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Personal Data</Text>
          </View>
          <PersonalData />
          <Separator style={styles.separator} />
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Items</Text>
          </View>
          <Items />
          <Separator style={styles.separator} />
          <Actions />
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
    marginTop: 50,
    marginBottom: 50,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 30,
    lineHeight: 70,
    textAlign: 'center',
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
