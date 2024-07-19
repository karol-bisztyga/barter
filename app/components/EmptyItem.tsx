import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ItemBorderRadius, ItemNamePlacement } from '../types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function EmptyItem({
  namePlacement = ItemNamePlacement['below'],
  borderRadius = ItemBorderRadius['up-only'],
  centerVertically = true,
  onPress,
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
      {namePlacement === ItemNamePlacement.above && (
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>Empty slot</Text>
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.imageWrapper,
          {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderRadius: borderRadius === ItemBorderRadius['all'] ? 20 : 0,
            height: '75%',
          },
        ]}
        activeOpacity={1}
        onPress={onPress}
      >
        <FontAwesome size={50} name="plus" />
      </TouchableOpacity>
      {namePlacement === ItemNamePlacement.below && (
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>Empty slot</Text>
        </View>
      )}
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
