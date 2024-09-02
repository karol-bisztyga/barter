import React, { useState } from 'react';
import { router } from 'expo-router';
import { useItemsContext } from '../../context/ItemsContext';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { addReport } from '../../db_utils/addReport';
import { authorizeUser } from '../../utils/reusableStuff';
import { showError, showSuccess } from '../../utils/notifications';

const SendReportModal = () => {
  const sessionContext = authorizeUser();
  const itemsContext = useItemsContext();

  const [report, setReport] = useState('');

  const sendReport = async () => {
    if (!itemsContext.othersItem) {
      console.error('othersItem has not been specified/set');
      showError('reported item not recognized properly');
      router.back();
      return;
    }
    try {
      await addReport(sessionContext, itemsContext.othersItem.id, report);
      showSuccess('report sent');
      router.back();
    } catch (e) {
      showError('error sending report');
      console.error('error sending report', e);
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
          <Button title="Send report" disabled={report.length < 10} onPress={sendReport} />
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
