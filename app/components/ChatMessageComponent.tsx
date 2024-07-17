import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types';

export default function ChatMessageComponent({ message }: { message: ChatMessage }) {
  const accordingStyle = message.user === 'self' ? styles.myMessage : styles.theirMessage;
  return (
    <View style={[styles.message, accordingStyle]}>
      <Text>{message.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    margin: 10,
    marginBottom: 5,
    marginTop: 5,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  myMessage: {
    marginLeft: 100,
    borderBottomLeftRadius: 20,
    backgroundColor: '#47469e',
  },
  theirMessage: {
    marginRight: 100,
    backgroundColor: '#a6aebd',
    borderBottomRightRadius: 20,
  },
});
