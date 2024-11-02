import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { SpearIcon } from '../../../../utils/icons';

export type ToggleItemProps = {
  id: string;
  isLast: boolean;
  onPress: () => void;
  Icon: React.FC<SvgProps>;
  disabled: boolean;
};

const ToggleItem = ({ id, isLast, onPress, Icon, disabled }: ToggleItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
      key={id}
      onPress={onPress}
    >
      <View style={styles.iconsWrapper}>
        <Icon
          style={[
            styles.icon,
            {
              opacity: disabled ? 0.3 : 1,
            },
          ]}
          width={48}
          height={48}
        />
        {disabled && <SpearIcon style={styles.icon} width={48} height={48} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderColor: '#E0E0E0',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
  },
  iconsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
});

export default ToggleItem;
