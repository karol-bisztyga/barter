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

const SendReportModal = () => {
  const { t } = useTranslation();

  const sessionContext = useAuth();
  const itemsContext = useItemsContext();
  const jokerContext = useJokerContext();

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
      <View style={styles.inputContainer}>
        <InputWrapper
          multiline={true}
          placeholder={t('send_report_reason')}
          secureTextEntry={true}
          value={report}
          onChangeText={setReport}
          style={styles.input}
          fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
        />
        <ButtonWrapper
          title={t('chats_send_report')}
          disabled={report.length < 10}
          onPress={sendReport}
          fillColor={SWIPE_BASE_BACKGROUND_COLOR_WITH_OPACITY}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    padding: 12,
    position: 'absolute',
    width: '100%',
    height: 200,
    gap: 12,
  },
  input: {
    textAlignVertical: 'top',
  },
});

export default SendReportModal;
