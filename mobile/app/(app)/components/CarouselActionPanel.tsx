import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ActionButton = {
  name: 'thumbs-down' | 'clock-o' | 'thumbs-up';
  align: 'flex-start' | 'center' | 'flex-end';
  marginTop: number;
  description: string;
};

const CarouselActionPanel = () => {
  const actionButtons: ActionButton[] = [
    {
      name: 'thumbs-down',
      align: 'flex-start',
      marginTop: -10,
      description: 'Swipe left if you are not interested',
    },
    {
      name: 'clock-o',
      align: 'center',
      marginTop: 30,
      description: 'Swipe down if you are not sure yet',
    },
    {
      name: 'thumbs-up',
      align: 'flex-end',
      marginTop: -10,
      description: 'Swipe right if you want this item',
    },
  ];

  return (
    <View style={styles.container}>
      {actionButtons.map((item) => {
        return (
          <View key={item.name} style={[styles.actionButtonWrapper, { alignItems: item.align }]}>
            <TouchableOpacity
              style={[styles.iconWrapper, { marginTop: item.marginTop }]}
              onPress={() => {
                // todo only show info what it does for now
                console.log(item.description);
              }}
              activeOpacity={1}
            >
              <FontAwesome size={28} name={item.name} style={styles.icon} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 100,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonWrapper: {
    flex: 1,
    borderRadius: 50,
  },
  iconWrapper: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 50,
    margin: 10,
  },
  icon: {
    textAlign: 'center',
    width: 50,
    height: 50,
    lineHeight: 50,
  },
});

export default CarouselActionPanel;
