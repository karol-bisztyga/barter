import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Items from './components/Items';

const SwitchItem = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Items />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwitchItem;
