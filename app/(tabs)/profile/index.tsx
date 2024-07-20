import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Separator from '../../components/Separator';
import Contact from './components/Contact';
import { generateImage } from '../../mocks/imageMocker';
import Items from './components/Items';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Profile() {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const scrollViewRef = useRef(null);

  const profileImageUrl = generateImage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView ref={scrollViewRef}>
          <View style={styles.profileImageWrapper}>
            <Image
              style={styles.profileImage}
              source={{ uri: profileImageUrl }}
              onLoadEnd={() => {
                setImageLoading(false);
              }}
            />
            {imageLoading && (
              <View style={styles.profileImageLoader}>
                <ActivityIndicator size="large" color="black" />
              </View>
            )}
          </View>
          <Separator style={styles.separator} />
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Personal Data</Text>
          </View>
          <Contact />
          <Separator style={styles.separator} />
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Items</Text>
          </View>
          <Items />
          <Separator style={styles.separator} />
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
  //
  itemsWrapper: {
    height: 100,
    padding: 10,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
});
