import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types';

export default function ChatMessageComponent({ message }: { message: ChatMessage }) {
  const accordingStyle =
    message.type === 'status'
      ? styles.statusMesssage
      : message.userType === 'self'
        ? styles.myMessage
        : styles.theirMessage;
  return (
    <View style={[styles.message, accordingStyle]}>
      <Text style={{ fontStyle: message.type === 'status' ? 'italic' : 'normal' }}>
        {message.content}
      </Text>
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
  statusMesssage: {
    alignSelf: 'center',
    backgroundColor: '#e5e5e5',
    borderRadius: 20,
    opacity: 0.5,
    paddingRight: 20,
    paddingLeft: 20,
  },
});
