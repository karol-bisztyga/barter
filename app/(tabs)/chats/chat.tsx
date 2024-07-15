import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ItemBorderRadius } from '../../types';
import Item from '../../components/Item';
import { useItemsContext } from '../../context/ItemsContext';
import { router } from 'expo-router';
import Separator from '../../components/Separator';

const ChatModal = () => {
  const itemsContext = useItemsContext();

  const [text, setText] = useState('');

  const { usersItem, othersItem } = itemsContext;
  if (usersItem === null || othersItem === null) {
    console.error('at least one of the items has not been set, redirecting back');
    router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.itemsWrapper}>
        <View style={styles.itemWrapper}>
          <View style={styles.usersItem}>
            <Item
              card={usersItem}
              onPress={() => {
                console.log('open item modal');
              }}
              showDescription={false}
              carouselActive={false}
              showName={false}
              borderRadius={ItemBorderRadius.all}
            />
          </View>
          <View style={styles.otherItem}>
            <Item
              card={othersItem}
              onPress={() => {
                console.log('open item modal');
              }}
              showDescription={false}
              carouselActive={false}
              showName={false}
              borderRadius={ItemBorderRadius.all}
            />
          </View>
        </View>
      </View>
      <Separator />
      <View style={{ flex: 7, marginTop: 20, marginBottom: 20, backgroundColor: 'red' }}></View>
      <Separator />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => {}}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
  },
  itemsWrapper: {
    paddingLeft: 20,
    paddingRight: 20,
    height: 200,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  touchableOpacityItem: {
    flex: 1,
  },
  usersItem: {
    flex: 1,
  },
  iconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  icon: {
    fontSize: 50,
  },
  otherItem: {
    flex: 1,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatModal;
