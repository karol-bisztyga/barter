import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import Background from '../../components/Background';

export default function TermsAndConditions() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <TextWrapper style={{ fontSize: 32 }}>{t('not_implemented_yet')}</TextWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
