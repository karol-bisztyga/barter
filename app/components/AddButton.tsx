import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ItemBorderRadius } from '../types';

const AddButton = ({
  onPress,
  borderRadius = ItemBorderRadius['up-only'],
}: {
  onPress: () => void;
  borderRadius?: ItemBorderRadius;
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    flex: 1,
    borderColor: '#bdbda9',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddButton;
