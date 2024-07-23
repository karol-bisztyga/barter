import React, { useEffect, useState } from 'react';
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AddButton from '../../components/AddButton';
import { ItemBorderRadius } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { MAX_ITEM_PICTURES } from '../../constants';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const AddItem = () => {
  const { usersItem } = useItemsContext();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pictures, setPictures] = useState<Array<string | null>>([]);

  useEffect(() => {
    setName(usersItem?.name ?? '');
    setDescription(usersItem?.description ?? '');

    const pics: Array<string | null> = usersItem?.images ?? [];
    for (let i = pics.length - 1; i < MAX_ITEM_PICTURES - 1; ++i) {
      pics.push(null);
    }

    setPictures(pics);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={[styles.nameInput, styles.input]}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.descriptionInput, styles.input]}
          placeholder="Description"
          multiline={true}
          value={description}
          onChangeText={setDescription}
        />
        <Text style={styles.sectionTitle}>Pictures</Text>
        <View style={styles.imageSlotsWrapper}>
          {pictures.map((item, index) => {
            const imageSize = (width * 3) / 4;
            return (
              <View style={[styles.imageSlot, { width: imageSize, height: imageSize }]} key={index}>
                {item ? (
                  <>
                    <Image source={{ uri: item }} style={styles.imageSlot} />

                    <TouchableOpacity
                      style={styles.editImageWrapper}
                      activeOpacity={1}
                      onPress={() => {
                        console.log('edit picture');
                        router.push('profile/addPicture');
                      }}
                    >
                      <FontAwesome size={30} name="pencil" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <AddButton
                    onPress={() => {
                      console.log('add picture');
                      router.push('profile/addPicture');
                    }}
                    borderRadius={ItemBorderRadius.all}
                  />
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.addButton}>
          <Button
            title="Save"
            onPress={() => {
              console.log('save item');
            }}
          />
          <Button
            color="red"
            title="Remove Item"
            onPress={() => {
              console.log('remove item');
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    margin: 10,
    padding: 10,
    fontSize: 30,
  },
  input: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  nameInput: {},
  descriptionInput: {
    height: 120,
  },
  imageSlotsWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSlot: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
  },
  submitButton: {
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  editImageWrapper: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    bottom: 0,
    right: 0,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    margin: 20,
  },
});

export default AddItem;
