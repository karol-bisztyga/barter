import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Keyboard,
  Platform,
  FlatList,
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
import { executeProtectedQuery } from '../../db_utils/executeProtectedQuery';
import { getServerAddress } from '../../utils/networkUtils';
import { useMatchContext } from '../../context/MatchContext';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import { useJokerContext } from '../../context/JokerContext';

const INPUT_WRAPPER_HEIGHT = 70;
const ITEMS_WRPPER_HEIGHT = 200;
const MESSAGES_PER_CHUNK = 10;

const NO_MORE_MESSAGES_LABEL = 'No more messages';
const NO_MESSAGES_YET_LABEL = 'No messages yet';

const Chat = () => {
  const sessionContext = authorizeUser();
  const jokerContext = useJokerContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);
  const [loadMoreMessagesEnabled, setLoadMoreMessagesEnabled] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const keyboardHeight = useSharedValue(0);
  const inputWrapperPosition = useSharedValue<number>(0);

  const flatListRef = useRef<FlatList>(null);

  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const matchContext = useMatchContext();

  const { currentMatchId } = matchContext;
  const { usersItemId, othersItem } = itemsContext;

  const generateStatusMessage = (content: string): ChatMessage => {
    return {
      content: content,
      type: 'status',
    };
  };

  if (!usersItemId || !othersItem || !currentMatchId) {
    try {
      if (!usersItemId) {
        throw new Error(`user's item not specified`);
      }
      if (!othersItem) {
        throw new Error(`other item not specified`);
      }
      if (!currentMatchId) {
        throw new Error(`match not specified`);
      }
    } catch (e) {
      handleError(jokerContext, ErrorType.CHAT_INITIALIZE, `${e}`, `${e}`);
    }
    router.back();
    return null;
  }

  const scrollMessagesToNewest = () => {
    flatListRef?.current?.scrollToIndex({ index: 0, animated: false });
  };

  const onMessage = (message: ChatMessage) => {
    setMessages((messages) => {
      if (messages.length === 1 && messages[0].content === NO_MESSAGES_YET_LABEL) {
        return [message];
      }
      return [message, ...messages];
    });
  };

  const onInitialMessages = (initialMessages: ChatMessage[]) => {
    if (!initialMessages.length) {
      setMessages([generateStatusMessage(NO_MESSAGES_YET_LABEL)]);
    } else {
      setLoadMoreMessagesEnabled(true);
      setMessages(initialMessages);
    }
  };

  useEffect(() => {
    const newSocket = io(getServerAddress(), {
      auth: {
        token: sessionContext.session,
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
      let customMessage = '';
      if (e.name === 'TokenExpiredError') {
        customMessage = 'Session expired';
        sessionContext.signOut();
      }
      if (e.includes && e.includes('match does not exist')) {
        customMessage = 'Match does not exist';
        matchContext.setMatches(matchContext.matches.filter((m) => m.id !== currentMatchId));
        router.back();
      }
      handleError(jokerContext, ErrorType.SOCKET, `${e}`, `${customMessage}`);
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
      const response = await executeProtectedQuery(
        sessionContext,
        'messages',
        'GET',
        {
          matchId: currentMatchId,
          offset: `${messages.length}`,
          limit: `${MESSAGES_PER_CHUNK}`,
        },
        null
      );
      const newMessages = response.data;

      if (
        newMessages.length < MESSAGES_PER_CHUNK &&
        messages.at(-1)?.content !== NO_MORE_MESSAGES_LABEL &&
        messages.length > MESSAGES_PER_CHUNK
      ) {
        newMessages.push(generateStatusMessage(NO_MORE_MESSAGES_LABEL));
        setLoadMoreMessagesEnabled(false);
      }
      setMessages([...messages, ...newMessages]);
    } catch (e) {
      handleError(jokerContext, ErrorType.LOAD_MESSAGES, `${e}`);
    }
  };

  const sendMessage = () => {
    if (newMessage.length === 0) {
      return;
    }
    if (!socket) {
      handleError(jokerContext, ErrorType.SOCKET, 'trying to use uninitialized socket');
      return;
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
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => {
              if (messages.length) {
                return null;
              }
              return (
                <View style={styles.messageLoaderWrapper}>
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
          <InputWrapper
            style={styles.input}
            placeholder="Type a message"
            blurOnSubmit={false}
            value={newMessage}
            onChangeText={setNewMessage}
            fillColor="white"
          />
          <View style={styles.buttonWrapper}>
            <ButtonWrapper
              title="Send"
              disabled={newMessage.length === 0}
              onPress={() => {
                sendMessage();
              }}
              fillColor="white"
            />
          </View>
        </Animated.View>
      </View>
      {matchContext.unmatching && (
        <View style={styles.unmatchLoaderWrapper}>
          <ActivityIndicator size="large" />
        </View>
      )}
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
  buttonWrapper: {
    width: 70,
    marginHorizontal: 4,
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
  },
  messageLoaderWrapper: {
    margin: 20,
  },
  unmatchLoaderWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, .7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chat;
