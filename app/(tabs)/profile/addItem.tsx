import React, { useEffect, useState } from 'react';
import { Button, Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AddButton from '../../components/AddButton';
import { ItemBorderRadius } from '../../types';
import { MAX_ITEM_PICTURES } from '../../constants';

const { width } = Dimensions.get('window');

const AddItem = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pictures, setPictures] = useState<string[]>([]);

  useEffect(() => {
    setPictures(new Array(MAX_ITEM_PICTURES).fill(null));
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
            if (!item) {
              return (
                <View style={[styles.imageSlot, { height: width / 3 - 20 }]} key={index}>
                  <AddButton onPress={() => {}} borderRadius={ItemBorderRadius.all} />
                </View>
              );
            }
            throw new Error('TODO: implement uploaded picture');
          })}
        </View>
        <Button
          title="Submit"
          onPress={() => {
            console.log('add item');
          }}
        />
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
    flexDirection: 'row',
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
});

export default AddItem;
