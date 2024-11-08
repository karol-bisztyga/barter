import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';

export default function Credits() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TextWrapper style={{ fontSize: 32 }}>{t('not_implemented_yet')}</TextWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
