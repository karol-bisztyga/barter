import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  View,
  StyleSheet,
  Keyboard,
  Platform,
  FlatList,
  Button,
  ActivityIndicator,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ChatMessage } from '../../types';
import ChatMessageComponent from '../../components/ChatMessageComponent';
import { router } from 'expo-router';
import ChatHeader from './components/ChatHeader';
import { useItemsContext } from '../../context/ItemsContext';
import io, { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { authorizeUser } from '../../utils/reusableStuff';
import { useUserContext } from '../../context/UserContext';
import Constants from 'expo-constants';
import { useSessionContext } from '../../../SessionContext';
import { executeQuery } from '../../db_utils/executeQuery';

const INPUT_WRAPPER_HEIGHT = 70;
const ITEMS_WRPPER_HEIGHT = 200;
const MESSAGES_PER_CHUNK = 10;

const Chat = () => {
  const token = authorizeUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);
  const [loadMoreMessagesEnabled, setLoadMoreMessagesEnabled] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const keyboardHeight = useSharedValue(0);
  const inputWrapperPosition = useSharedValue<number>(0);

  const flatListRef = useRef<FlatList>(null);

  const userContext = useUserContext();
  const sessionContext = useSessionContext();
  const itemsContext = useItemsContext();

  const { usersItemId, othersItem, currentMatchId } = itemsContext;

  const generateStatusMessage = (content: string): ChatMessage => {
    return {
      content: content,
      type: 'status',
    };
  };

  if (!usersItemId || !othersItem || !currentMatchId) {
    if (!usersItemId) {
      console.error(`user's item not specified`);
    }
    if (!othersItem) {
      console.error(`other item not specified`);
    }
    if (!currentMatchId) {
      console.error(`match not specified`);
    }
    router.back();
    return null;
  }

  const scrollMessagesToNewest = () => {
    flatListRef?.current?.scrollToIndex({ index: 0, animated: false });
  };

  const socketUrl = `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:${process.env.EXPO_PUBLIC_SERVER_PORT}`;

  const onMessage = (message: ChatMessage) => {
    setMessages((messages) => [message, ...messages]);
  };

  const onInitialMessages = (initialMessages: ChatMessage[]) => {
    if (!initialMessages.length) {
      setMessages([generateStatusMessage('No messages yet')]);
    } else {
      setLoadMoreMessagesEnabled(true);
      setMessages(initialMessages);
    }
  };

  useEffect(() => {
    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      query: {
        matchId: currentMatchId,
        userId: userContext.data?.id,
      },
    });
    setSocket(newSocket);

    newSocket.on('initialMessages', (initialMessages: string) => {
      const parsedMessages: ChatMessage[] = JSON.parse(initialMessages);
      onInitialMessages(parsedMessages);
    });

    newSocket.on('message', (message: ChatMessage) => {
      onMessage(message);
    });

    newSocket.on('connect', () => {
      console.log('socket connected', newSocket.connected);
    });

    newSocket.on('error', (e) => {
      console.error('socket error', e);
      if (e.name === 'TokenExpiredError') {
        sessionContext.signOut();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadMoreMessages = async () => {
    try {
      if (!loadMoreMessagesEnabled) {
        return;
      }
      const response = await executeQuery(
        'messages',
        'GET',
        {
          matchId: currentMatchId,
          offset: `${messages.length}`,
          limit: `${MESSAGES_PER_CHUNK}`,
        },
        null,
        token
      );
      const newMessages = response.data;
      console.log('load more messages response', newMessages);

      if (
        newMessages.length < MESSAGES_PER_CHUNK &&
        messages.at(-1)?.content !== 'No more messages'
      ) {
        newMessages.push(generateStatusMessage('No more messages'));
        setLoadMoreMessagesEnabled(false);
      }
      setMessages([...messages, ...newMessages]);
    } catch (e) {
      console.error('error getting messages', e);
    }
  };

  const sendMessage = () => {
    if (newMessage.length === 0) {
      return;
    }
    if (!socket) {
      throw new Error('trying to use uninitialized socket');
    }
    const newMessageObject: ChatMessage = {
      content: newMessage,
      type: 'message',
      userId: userContext.data?.id,
    };
    setNewMessage('');
    scrollMessagesToNewest();
    socket.emit('message', newMessageObject);
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        keyboardHeight.value = withTiming(event.endCoordinates.height, {
          duration: event.duration / 5,
        });
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        keyboardHeight.value = withTiming(0, { duration: event.duration / 5 });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight]);

  const messageListAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: inputWrapperPosition.value - ITEMS_WRPPER_HEIGHT,
    };
  }, [keyboardHeight]);

  const inputWrapperAnimatedStyle = useAnimatedStyle(() => {
    let bottom: number = 0;
    if (Platform.OS === 'ios') {
      bottom = keyboardHeight.value ? keyboardHeight.value - INPUT_WRAPPER_HEIGHT : 0;
    }
    return {
      bottom,
    };
  }, [keyboardHeight]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <ChatHeader />
        <Animated.View style={[styles.messageList, messageListAnimatedStyle]}>
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 0,
            }}
            onContentSizeChange={() => {
              if (messages.length === 0 || initialScrollPerformed) {
                return;
              }
              scrollMessagesToNewest();
              setInitialScrollPerformed(true);
            }}
            renderItem={({ item }) => <ChatMessageComponent message={item} />}
            keyExtractor={(message: ChatMessage) =>
              message.id || `${message.type}-${message.content}`
            }
            onEndReached={() => {
              console.log('>>> on end reached', messages.length);
              loadMoreMessages();
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => {
              if (messages.length) {
                return null;
              }
              return (
                <View style={styles.loaderWrapper}>
                  <ActivityIndicator size="large" />
                </View>
              );
            }}
          />
        </Animated.View>
        <Animated.View
          style={[styles.inputContainer, inputWrapperAnimatedStyle]}
          onLayout={(e) => {
            inputWrapperPosition.value = e.nativeEvent.layout.y;
          }}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            blurOnSubmit={false}
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Button
            title="Send"
            disabled={newMessage.length === 0}
            onPress={() => {
              sendMessage();
            }}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageList: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 200,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    height: INPUT_WRAPPER_HEIGHT,
    position: 'absolute',
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 40,
  },
  loaderWrapper: {
    margin: 20,
  },
});

export default Chat;
