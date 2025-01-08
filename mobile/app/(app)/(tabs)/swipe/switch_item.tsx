import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Items from './components/switch_item/Items';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useTranslation } from 'react-i18next';
import Background from '../../components/Background';

const SwitchItem = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Background tile="main" />
      <TextWrapper style={styles.title}>{t('match_switch_my_item')}</TextWrapper>
      <ScrollView>
        <Items />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    margin: 12,
    textAlign: 'center',
  },
});

export default SwitchItem;
