import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ItemBorderRadius, ItemNamePlacement } from '../types';
import AddButton from './AddButton';

const EmptySlotLabel = () => (
  <View style={styles.nameWrapper}>
    <Text style={styles.name}>Add Item</Text>
  </View>
);

export default function EmptyItem({
  namePlacement = ItemNamePlacement['below'],
  borderRadius = ItemBorderRadius['up-only'],
  centerVertically = true,
  onPress = () => {},
}: {
  namePlacement?: ItemNamePlacement;
  borderRadius?: ItemBorderRadius;
  centerVertically?: boolean;
  onPress?: () => void;
}) {
  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: centerVertically ? 'center' : 'flex-start',
        },
      ]}
    >
      {namePlacement === ItemNamePlacement.above && <EmptySlotLabel />}
      <AddButton onPress={onPress} borderRadius={borderRadius} />
      {namePlacement === ItemNamePlacement.below && <EmptySlotLabel />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrapper: {
    borderColor: '#bdbda9',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameWrapper: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
