import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

const getDefaultFont = () => {
  if (Platform.OS === 'android') {
    return 'Roboto';
  }
  if (Platform.OS === 'ios') {
    return 'SF Pro';
  }
  return '';
};

export const useFont = () => {
  const [loadedFonts] = useFonts({
    CaudexRegular: require('../../../assets/fonts/Caudex/Caudex-Regular.ttf'),
  });

  return loadedFonts ? 'CaudexRegular' : getDefaultFont();
};
