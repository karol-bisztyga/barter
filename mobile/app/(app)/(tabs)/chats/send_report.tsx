import React, { useState } from 'react';
import { router } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { StyleSheet, View } from 'react-native';
import { addReport } from '../../db_utils/addReport';
import { authorizeUser } from '../../utils/reusableStuff';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import InputWrapper from '../../genericComponents/InputWrapper';
import { useJokerContext } from '../../context/JokerContext';

const SendReportModal = () => {
  const sessionContext = authorizeUser();
  const itemsContext = useItemsContext();
  const jokerContext = useJokerContext();

  const [report, setReport] = useState('');

  const sendReport = async () => {
    try {
      if (!itemsContext.othersItem) {
        throw new Error('othersItem has not been specified/set');
      }
      await addReport(sessionContext, itemsContext.othersItem.id, report);
      jokerContext.showSuccess('Report sent');
      router.back();
    } catch (e) {
      handleError(jokerContext, ErrorType.SEND_REPORT, `${e}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <InputWrapper
          multiline={true}
          placeholder="reason"
          secureTextEntry={true}
          value={report}
          onChangeText={setReport}
          style={styles.input}
          fillColor="white"
        />
        <ButtonWrapper
          title="Send report"
          disabled={report.length < 10}
          onPress={sendReport}
          fillColor="white"
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
    padding: 10,
    position: 'absolute',
    width: '100%',
    height: 200,
  },
  input: {
    textAlignVertical: 'top',
  },
});

export default SendReportModal;
