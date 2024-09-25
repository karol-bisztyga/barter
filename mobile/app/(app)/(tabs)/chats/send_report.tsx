import React, { useState } from 'react';
import { router } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { StyleSheet, TextInput, View } from 'react-native';
import { addReport } from '../../db_utils/addReport';
import { authorizeUser } from '../../utils/reusableStuff';
import { showSuccess } from '../../utils/notifications';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';

const SendReportModal = () => {
  const sessionContext = authorizeUser();
  const itemsContext = useItemsContext();

  const [report, setReport] = useState('');

  const sendReport = async () => {
    try {
      if (!itemsContext.othersItem) {
        throw new Error('othersItem has not been specified/set');
      }
      await addReport(sessionContext, itemsContext.othersItem.id, report);
      showSuccess('Report sent');
      router.back();
    } catch (e) {
      handleError(ErrorType.SEND_REPORT, `${e}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          placeholder="reason"
          secureTextEntry={true}
          value={report}
          onChangeText={setReport}
          style={styles.input}
        />
        <View style={styles.buttonWrapper}>
          <ButtonWrapper title="Send report" disabled={report.length < 10} onPress={sendReport} />
        </View>
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
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 120,
    lineHeight: 30,
    margin: 10,
    width: '80%',
    textAlignVertical: 'top',
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default SendReportModal;
