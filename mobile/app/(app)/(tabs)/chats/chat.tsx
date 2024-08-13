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
// import { generateMessages } from '../../mocks/messagesMocker';
import { ChatMessage } from '../../types';
import ChatMessageComponent from '../../components/ChatMessageComponent';
import { router } from 'expo-router';
import ChatHeader from './components/ChatHeader';
import { useItemsContext } from '../../context/ItemsContext';
import io, { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { authorizeUser } from '../../utils/reusableStuff';
import { useUserContext } from '../../context/UserContext';

const INPUT_WRAPPER_HEIGHT = 70;
// const MESSAGES_ON_SCREEN_LIMIT = 30;
const ITEMS_WRPPER_HEIGHT = 200;

const Chat = () => {
  const token = authorizeUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const keyboardHeight = useSharedValue(0);
  const inputWrapperPosition = useSharedValue<number>(0);

  const flatListRef = useRef<FlatList>(null);

  const userContext = useUserContext();

  const itemsContext = useItemsContext();
  const { usersItemId, othersItem, currentMatchId } = itemsContext;

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

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: {
        token,
      },
      query: {
        matchId: currentMatchId,
        userId: userContext.data?.id,
      },
    });
    setSocket(newSocket);

    newSocket.on('message', (message) => {
      console.log('socket message:', message);
    });

    newSocket.on('connect', () => {
      console.log('socket connected', newSocket.connected);
    });
    newSocket.on('error', (error) => {
      console.log('socket error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadMessages = () => {
    // setTimeout(() => {
    //   const olderMessages: ChatMessage[] = generateMessages(20);
    //   setMessages([...messages, ...olderMessages]);
    // }, 2000);
    setTimeout(() => {
      // in case there are no messages
      setMessages([
        {
          content: 'No messages yet',
          type: 'status',
        },
      ]);
    }, 700);
  };

  const sendNewMessage = () => {
    if (newMessage.length === 0) {
      return;
    }
    const newMessageObject: ChatMessage = {
      content: newMessage,
      type: 'message',
      userType: 'self',
    };
    // setMessages([newMessageObject, ...messages]);
    // setNewMessage('');
    // scrollMessagesToNewest();
    if (!socket) {
      throw new Error('trying to use uninitialized socket');
    }
    socket.emit('message', newMessageObject);
  };
  // const loadNewMessages = () => {
  //   const numberOfNewMessages = Math.floor(Math.random() * 3);
  //   const newMessages = generateMessages(numberOfNewMessages, 'other');

  //   setMessages([...newMessages, ...messages]);
  // };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!messages.length) {
  //       return;
  //     }
  //     loadNewMessages();
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [messages]);

  useEffect(() => {
    loadMessages();
  }, []);

  // todo, for now do not check the limit...
  // useEffect(() => {
  //   if (messages.length > MESSAGES_ON_SCREEN_LIMIT) {
  //     setMessages(messages.slice(0, MESSAGES_ON_SCREEN_LIMIT));
  //   }
  // }, [messages]);

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
            // keyExtractor={(message: ChatMessage, index: number) => index}
            onEndReached={() => {
              console.log('>>> here', messages.length);
              loadMessages();
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
              sendNewMessage();
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
