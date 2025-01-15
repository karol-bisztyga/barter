import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ChatMessage } from '../../../types';
import { useUserContext } from '../../../context/UserContext';
import { ErrorType, handleError } from '../../../utils/errorHandler';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { useJokerContext } from '../../../context/JokerContext';
import { useTranslation } from 'react-i18next';
import { BLACK_COLOR, GOLD_COLOR_3, RED_COLOR, WHITE_COLOR } from '../../../constants';
import { useFont } from '../../../hooks/useFont';
import { hexToRgbaString } from '../../../utils/harmonicColors';

const { width } = Dimensions.get('window');

type Config = {
  fontFamily: string;
  wrapperStyle: object;
  textStyle: object;
};

export default function ChatMessageComponent({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const fontFamily = useFont();

  if (!userContext.data?.id) {
    handleError(
      t,
      jokerContext,
      ErrorType.CORRUPTED_SESSION,
      'chat message component: user id not provided'
    );
    return null;
  }

  const getConfigForMessageType = (): Config => {
    switch (message.type) {
      case 'status':
        return {
          fontFamily: fontFamily.italic,
          wrapperStyle: styles.statusMesssageWrapper,
          textStyle: styles.statusMesssage,
        };
      case 'message':
        return {
          fontFamily: fontFamily.regular,
          wrapperStyle:
            message.userId === userContext.data?.id
              ? styles.myMessageWrapper
              : styles.theirMessageWrapper,
          textStyle:
            message.userId === userContext.data?.id ? styles.myMessage : styles.theirMessage,
        };
    }
  };

  const config: Config = getConfigForMessageType();

  return (
    <View style={[styles.messageWrapper, config.wrapperStyle]}>
      <TextWrapper
        style={[
          styles.message,
          { fontFamily: message.type === 'status' ? fontFamily.italic : fontFamily.regular },
          config.textStyle,
        ]}
      >
        {message.content}
      </TextWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    margin: 10,
    marginBottom: 5,
    marginTop: 5,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    marginLeft: width / 3,
    borderBottomLeftRadius: 20,
    backgroundColor: RED_COLOR,
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
    marginRight: width / 3,
    backgroundColor: GOLD_COLOR_3,
    borderBottomRightRadius: 20,
  },
  statusMesssageWrapper: {
    alignSelf: 'center',
    // backgroundColor: 'rgba(255,255,255,.5)',
    borderRadius: 20,
    paddingRight: 20,
    paddingLeft: 20,
  },
  message: {
    fontSize: 16,
  },
  statusMesssage: {
    color: hexToRgbaString(WHITE_COLOR, 0.5),
  },
  myMessage: {
    color: WHITE_COLOR,
  },
  theirMessage: {
    color: BLACK_COLOR,
  },
});
