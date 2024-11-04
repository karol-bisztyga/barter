import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CannonIcon } from '../../../utils/icons';
import Background from '../../../components/Background';
import TextWrapper from '../../../genericComponents/TextWrapper';
import { useSoundContext } from '../../../context/SoundContext';

const ICON_SIZE = 200;

type ReloadProps = {
  onPress: () => void;
};

const Reload = ({ onPress }: ReloadProps) => {
  const soundContext = useSoundContext();

  return (
    <View style={styles.container}>
      <Background tile="sword" forceFullScreen />
      <TextWrapper style={styles.label}>Reload</TextWrapper>
      <TouchableOpacity
        onPress={() => {
          soundContext.playSound('click');
          onPress();
        }}
      >
        <CannonIcon width={ICON_SIZE} height={ICON_SIZE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  label: {
    width: '100%',
    height: 60,
    fontSize: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Reload;
