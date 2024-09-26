import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ChatMessage } from '../types';
import { useUserContext } from '../context/UserContext';
import { ErrorType, handleError } from '../utils/errorHandler';
import TextWrapper from '../genericComponents/TextWrapper';

const { width } = Dimensions.get('window');

export default function ChatMessageComponent({ message }: { message: ChatMessage }) {
  const userContext = useUserContext();

  if (!userContext.data?.id) {
    handleError(ErrorType.CORRUPTED_SESSION, 'chat message component: user id not provided');
    return null;
  }

  const accordingStyle =
    message.type === 'status'
      ? styles.statusMesssage
      : message.userId === userContext.data?.id
        ? styles.myMessage
        : styles.theirMessage;
  return (
    <View style={[styles.message, accordingStyle]}>
      <TextWrapper style={{ fontStyle: message.type === 'status' ? 'italic' : 'normal' }}>
        {message.content}
      </TextWrapper>
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
    alignSelf: 'flex-end',
    marginLeft: width / 3,
    borderBottomLeftRadius: 20,
    backgroundColor: '#7573d9',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    marginRight: width / 3,
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
