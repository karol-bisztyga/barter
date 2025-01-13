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

export type FontFamily = {
  regular: string;
  bold: string;
  italic: string;
  boldItalic: string;
};

export const useFont = (): FontFamily => {
  const [loadedFonts] = useFonts({
    CaudexRegular: require('../../../assets/fonts/Caudex/Caudex-Regular.ttf'),
    CaudexBold: require('../../../assets/fonts/Caudex/Caudex-Bold.ttf'),
    CaudexItalic: require('../../../assets/fonts/Caudex/Caudex-Italic.ttf'),
    CaudexBoldItalic: require('../../../assets/fonts/Caudex/Caudex-BoldItalic.ttf'),
  });

  if (!loadedFonts) {
    return {
      regular: getDefaultFont(),
      bold: getDefaultFont(),
      italic: getDefaultFont(),
      boldItalic: getDefaultFont(),
    };
  }

  return {
    regular: 'CaudexRegular',
    bold: 'CaudexBold',
    italic: 'CaudexItalic',
    boldItalic: 'CaudexBoldItalic',
  };
};
