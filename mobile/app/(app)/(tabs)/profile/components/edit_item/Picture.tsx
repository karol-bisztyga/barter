import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { GoldGradient } from '../../../../genericComponents/gradients/GoldGradient';
import { Torch2Icon } from '../../../../utils/icons';
import { ICON_WRAPPER_SIZE, IconButton } from '../../../../genericComponents/IconButton';

const IMAGE_SIZE = 245;
const BORDER_SIZE = 2;

type PictureProps = {
  index: number;
  uri: string;
  removePicture: (index: number) => void;
  removingDisabled: boolean;
  isBeingRemoved: boolean;
};

export const Picture = ({
  index,
  uri,
  removePicture,
  removingDisabled,
  isBeingRemoved,
}: PictureProps) => {
  return (
    <View style={styles.container}>
      <View style={{ opacity: isBeingRemoved ? 0.5 : 1 }}>
        <GoldGradient />
        <Image source={{ uri }} style={styles.image} />
        <IconButton
          Icon={Torch2Icon}
          style={styles.removeImageWrapper}
          onPress={() => removePicture(index)}
          disabled={removingDisabled}
        />
      </View>
      {isBeingRemoved && <ActivityIndicator size="large" style={styles.removeLoader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: IMAGE_SIZE + BORDER_SIZE * 2,
    height: IMAGE_SIZE + BORDER_SIZE * 2,
  },
  image: {
    position: 'absolute',
    top: BORDER_SIZE,
    left: BORDER_SIZE,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    resizeMode: 'cover',
  },
  removeImageWrapper: {
    position: 'absolute',
    top: -ICON_WRAPPER_SIZE / 2,
    right: -ICON_WRAPPER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeLoader: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: IMAGE_SIZE / 2 - 50,
    left: IMAGE_SIZE / 2 - 50,
  },
});
