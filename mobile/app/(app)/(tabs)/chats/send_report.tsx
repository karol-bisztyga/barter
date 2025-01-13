import React, { useState } from 'react';
import { router } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { StyleSheet, View } from 'react-native';
import { addReport } from '../../db_utils/addReport';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import { useJokerContext } from '../../context/JokerContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY } from '../../constants';
import Background from '../../components/Background';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useFont } from '../../hooks/useFont';
import { capitalizeFirstLetterOfEveryWord } from '../../utils/reusableStuff';

const SendReportModal = () => {
  const { t } = useTranslation();

  const sessionContext = useAuth();
  const itemsContext = useItemsContext();
  const jokerContext = useJokerContext();

  const fontFamily = useFont();

  const [report, setReport] = useState('');

  const sendReport = async () => {
    try {
      if (!itemsContext.othersItem) {
        throw new Error('othersItem has not been specified/set');
      }
      await addReport(sessionContext, itemsContext.othersItem.id, report);
      jokerContext.showSuccess(t('chats_report_sent'));
      router.back();
    } catch (e) {
      handleError(t, jokerContext, ErrorType.SEND_REPORT, `${e}`);
    }
  };

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <View style={styles.inputContainer}>
        <Background tile="paper" />
        <TextWrapper style={[styles.label, { fontFamily: fontFamily.boldItalic }]}>
          {capitalizeFirstLetterOfEveryWord(t('send_report_reason'))}
        </TextWrapper>
        <View style={styles.inputWrapper}>
          <InputWrapper
            placeholder={capitalizeFirstLetterOfEveryWord(t('send_report_reason'))}
            value={report}
            onChangeText={setReport}
            fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
          />
        </View>
        <ButtonWrapper
          title={capitalizeFirstLetterOfEveryWord(t('chats_send_report'))}
          disabled={report.length < 10}
          onPress={sendReport}
          mode="black"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  inputContainer: {
    flexDirection: 'column',
    padding: 10,
    gap: 8,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  label: { fontSize: 14 },
  inputWrapper: { marginVertical: 8 },
});

export default SendReportModal;
