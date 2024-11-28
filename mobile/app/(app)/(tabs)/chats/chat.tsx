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
import ChatMessageComponent from './components/ChatMessageComponent';
import { router } from 'expo-router';
import ChatHeader from './components/ChatHeader';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { useMatchContext } from '../../context/MatchContext';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { FILL_COLOR } from '../profile/components/items/editing_panels/constants';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSocketContext } from '../../context/SocketContext';
import { getMessages } from '../../db_utils/getMessages';

const INPUT_WRAPPER_HEIGHT = 70;
const ITEMS_WRPPER_HEIGHT = 200;
const MESSAGES_PER_CHUNK = 10;

const Chat = () => {
  const { t } = useTranslation();

  const sessionContext = useAuth();
  const jokerContext = useJokerContext();
  const socketContext = useSocketContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);
  const [loadMoreMessagesEnabled, setLoadMoreMessagesEnabled] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const keyboardHeight = useSharedValue(0);
  const inputWrapperPosition = useSharedValue<number>(0);

  const flatListRef = useRef<FlatList>(null);

  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const matchContext = useMatchContext();

  const { currentMatchId, setCurrentMatchId, matches } = matchContext;
  const { usersItemId, othersItem } = itemsContext;

  useEffect(() => {
    // validate data on every render, if something's wrong go back to chats
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
        handleError(t, jokerContext, ErrorType.CHAT_INITIALIZE, `${e}`);
      }
      // router.replace('chats');
      router.back();
    }
    if (currentMatchId && !matches.map((m) => m.id).includes(currentMatchId)) {
      // router.replace('chats');
      router.back();
    }
  });

  useEffect(() => {
    if (!usersItemId || !othersItem || !currentMatchId) {
      return;
    }
    loadMoreMessages();

    socketContext.joinMatch(currentMatchId);

    return () => {
      socketContext.leaveMatch(currentMatchId);
      setCurrentMatchId(null);
    };
  }, []);

  // when the message comes from the socket
  useEffect(() => {
    if (!socketContext.messagesFromSocket.length) {
      return;
    }
    setMessages((messages) => [...socketContext.messagesFromSocket, ...messages]);
    socketContext.setMessagesFromSocket([]);
  }, [socketContext.messagesFromSocket]);

  const generateStatusMessage = (content: string): ChatMessage => {
    return {
      content: content,
      type: 'status',
    };
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

  const scrollMessagesToNewest = () => {
    flatListRef?.current?.scrollToIndex({ index: 0, animated: false });
  };

  const loadMoreMessages = async () => {
    setLoadingMessages(true);
    try {
      if (!loadMoreMessagesEnabled || !currentMatchId) {
        setLoadingMessages(false);
        return;
      }
      const response = await getMessages(
        sessionContext,
        currentMatchId,
        `${messages.length}`,
        `${MESSAGES_PER_CHUNK}`
      );
      const newMessages = response.messages;

      if (
        newMessages.length < MESSAGES_PER_CHUNK &&
        messages.at(-1)?.content !== t('chats_no_more_messages') &&
        messages.length > MESSAGES_PER_CHUNK
      ) {
        newMessages.push(generateStatusMessage(t('chats_no_more_messages')));
        setLoadMoreMessagesEnabled(false);
      } else if (newMessages.length === 0) {
        newMessages.push(generateStatusMessage(t('chats_no_more_messages')));
        setLoadMoreMessagesEnabled(false);
      }
      setMessages([...messages, ...newMessages]);
    } catch (e) {
      handleError(t, jokerContext, ErrorType.LOAD_MESSAGES, `${e}`);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.length === 0 || !currentMatchId) {
      return;
    }
    const newMessageObject: ChatMessage = {
      content: newMessage,
      type: 'message',
      userId: userContext.data?.id,
    };
    scrollMessagesToNewest();
    socketContext.sendMessage(currentMatchId, newMessageObject);
    setNewMessage('');
  };

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
              if (!loadingMessages) {
                loadMoreMessages();
              }
            }}
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
          <View style={styles.inputContainerInner}>
            <InputWrapper
              style={styles.input}
              placeholder={t('chats_type_a_message')}
              blurOnSubmit={false}
              value={newMessage}
              onChangeText={setNewMessage}
              fillColor={FILL_COLOR}
            />
            <View style={styles.buttonWrapper}>
              <ButtonWrapper
                title={t('send')}
                disabled={newMessage.length === 0}
                onPress={() => {
                  sendMessage();
                }}
                fillColor={FILL_COLOR}
              />
            </View>
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
    position: 'absolute',
    width: '100%',
  },
  inputContainerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: INPUT_WRAPPER_HEIGHT,
    padding: 10,
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
