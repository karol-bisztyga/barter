import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Keyboard,
  Platform,
  FlatList,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
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
import ButtonWrapper, { BUTTON_HEIGHT } from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { FILL_COLOR } from '../profile/components/items/editing_panels/constants';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSocketContext } from '../../context/SocketContext';
import { getMessages } from '../../db_utils/getMessages';
import { updateMatchNotified } from '../../db_utils/updateMatchNotified';
import Background from '../../components/Background';

const MESSAGES_PER_CHUNK = 10;
const SEND_MESSAGE_TIMEOUT = 3000;
const SEND_BUTTON_WIDTH = 84;

const { width } = Dimensions.get('window');

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
  const [sendingEnabled, setSendingEnabled] = useState(true);
  const [inputContainerHeight, setInputContainerHeight] = useState(0);
  const [headerMaxHeight, setHeaderMaxHeight] = useState(0);

  const keyboardHeight = useSharedValue(0);
  const currentHeaderHeight = useSharedValue(0);

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

  // handle seen messages
  const updateDateNotifiedWrapper = () => {
    (async () => {
      try {
        await updateDateNotified();
      } catch (e) {
        handleError(t, jokerContext, ErrorType.UPDATE_MATCH, `${e}`);
      }
    })();
  };

  const updateDateNotified = async () => {
    if (!currentMatchId) {
      return;
    }
    const dateNotified = Date.now();

    // update in db
    // todo if you want to implement "seen" feature, you should use sockets here, and probably modify db a bit
    await updateMatchNotified(sessionContext, currentMatchId, `${dateNotified}`);

    // update locally
    const updatedMatches = [...matchContext.matches];
    for (const match of updatedMatches) {
      if (match.id === currentMatchId) {
        match.dateNotified = dateNotified;
      }
    }

    matchContext.setMatches(updatedMatches);
  };

  useEffect(updateDateNotifiedWrapper, []);
  useEffect(updateDateNotifiedWrapper, [messages]);
  //

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
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const duration = event.duration / 5;
        keyboardHeight.value = withTiming(event.endCoordinates.height, {
          duration,
        });
        currentHeaderHeight.value = withTiming(0, { duration });
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        const duration = event.duration / 5;
        keyboardHeight.value = withTiming(0, { duration });
        currentHeaderHeight.value = withTiming(headerMaxHeight, { duration });
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [headerMaxHeight]);

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
    if (!sendingEnabled) {
      jokerContext.showNonBlockingInfo(t('chat_sending_disabled_too_often'));
      return;
    }
    if (newMessage.length === 0 || !currentMatchId) {
      return;
    }
    setSendingEnabled(false);
    const newMessageObject: ChatMessage = {
      content: newMessage,
      type: 'message',
      userId: userContext.data?.id,
    };
    scrollMessagesToNewest();
    socketContext.sendMessage(currentMatchId, newMessageObject);
    setNewMessage('');
    setTimeout(() => {
      setSendingEnabled(true);
    }, SEND_MESSAGE_TIMEOUT);
  };

  const headerStyle = useAnimatedStyle(() => {
    if (!headerMaxHeight) {
      return {};
    }
    return {
      height: currentHeaderHeight.value,
    };
  });

  useEffect(() => {
    if (!headerMaxHeight) {
      return;
    }
    currentHeaderHeight.value = headerMaxHeight;
  }, [headerMaxHeight]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={inputContainerHeight + 16}
    >
      <SafeAreaView style={styles.container}>
        <Background tile="main" />
        <View style={styles.scrollViewContent}>
          <Animated.View
            style={[styles.headerContainer, headerStyle]}
            onLayout={(e) => {
              if (headerMaxHeight) {
                return;
              }
              setHeaderMaxHeight(e.nativeEvent.layout.height);
            }}
          >
            <ChatHeader />
          </Animated.View>
          <Animated.View style={[styles.messageList]}>
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
            style={[styles.inputContainer]}
            onLayout={(e) => {
              setInputContainerHeight(e.nativeEvent.layout.height);
            }}
          >
            <View
              style={[styles.inputContainerInner, { width: width - 40 - SEND_BUTTON_WIDTH - 8 }]}
            >
              <InputWrapper
                style={styles.input}
                placeholder={t('chats_type_a_message')}
                blurOnSubmit={false}
                value={newMessage}
                onChangeText={setNewMessage}
                fillColor={FILL_COLOR}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <ButtonWrapper
                title={t('send')}
                disabled={newMessage.length === 0 || !sendingEnabled}
                onPress={sendMessage}
                mode="black"
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageList: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputContainerInner: {
    flexDirection: 'row',
    height: BUTTON_HEIGHT,
  },
  input: {},
  buttonWrapper: {
    width: SEND_BUTTON_WIDTH,
    marginLeft: 8,
    marginRight: 0,
    justifyContent: 'center',
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
