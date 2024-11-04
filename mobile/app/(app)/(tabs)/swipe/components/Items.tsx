import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ItemData } from '../../../types';
import { useItemsContext } from '../../../context/ItemsContext';
import Background from '../../../components/Background';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { useSoundContext } from '../../../context/SoundContext';

const Items = () => {
  const itemsContext = useItemsContext();
  const soundContext = useSoundContext();

  const items = itemsContext.usersItemsLikedByTargetItemOwner;

  return (
    <View style={styles.container}>
      <Background tile="sword" forceFullScreen />
      {items.map((item: ItemData, index: number) => {
        const borderWidth = itemsContext.usersItemId === item.id ? 5 : 0;
        return (
          <TouchableOpacity
            style={[styles.itemWrapper, { borderWidth }]}
            key={index}
            activeOpacity={1}
            onPress={() => {
              soundContext.playSound('click');
              if (itemsContext.usersItemId === item.id) {
                return;
              }
              itemsContext.setUsersItemId(item.id);
            }}
          >
            <Background tile="stone" style={styles.background} opacity={1} />
            <View style={styles.itemInnerWrapper}>
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <TextWrapper style={styles.labelName}>{item.name}</TextWrapper>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  itemWrapper: {
    height: 300,
    margin: 20,
    overflow: 'hidden',
    borderColor: 'green',
    borderRadius: 20,
  },
  background: {
    borderRadius: 20,
  },
  itemInnerWrapper: {
    flex: 1,
    padding: 10,
  },
  image: {
    flex: 1,
    borderRadius: 20,
  },
  labelName: {
    textAlign: 'center',
    fontSize: 20,
  },
});

export default Items;
