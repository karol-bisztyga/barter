import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  View,
  StyleSheet,
  Text,
  Keyboard,
  Platform,
  FlatList,
  Button,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { generateMessages } from '../../mocks/messagesMocker';
import Separator from '../../components/Separator';
import { router } from 'expo-router';

const INPUT_WRAPPER_HEIGHT = 70;

const App = () => {
  const keyboardHeight = useSharedValue(0);
  const inputWrapperPosition = useSharedValue<number>(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const scrollMessagesToNewest = () => {
    flatListRef?.current?.scrollToIndex({ index: 0, animated: false });
  };

  useEffect(() => {
    setMessages(generateMessages(Math.floor(Math.random() * 30) + 20));
  }, []);

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
      height: inputWrapperPosition.value,
    };
  }, [keyboardHeight]);

  const inputWrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      bottom: keyboardHeight.value ? keyboardHeight.value - INPUT_WRAPPER_HEIGHT : 0,
    };
  }, [keyboardHeight]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollViewContent}>
        <Animated.View style={[styles.messageList, messageListAnimatedStyle]}>
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted={true}
            onContentSizeChange={() => {
              if (initialScrollPerformed) {
                return;
              }
              scrollMessagesToNewest();
              setInitialScrollPerformed(true);
            }}
            renderItem={({ item }) => (
              <View>
                <Text style={{ margin: 20 }}>{item}</Text>
                <Separator />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
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
            onFocus={() => {
              scrollMessagesToNewest();
            }}
          />
          <Button
            title="Send"
            onPress={() => {
              router.back();
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
    top: 0,
    width: '100%',
    height: 200,
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
});

export default App;
