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

export type FontStyle = 'regular' | 'bold' | 'italic' | 'boldItalic';

export const useFont = (fontStyle: FontStyle = 'regular') => {
  const [loadedFonts] = useFonts({
    MedievalSharp: require('../../../assets/fonts/MedievalSharp.ttf'),
    CaudexRegular: require('../../../assets/fonts/Caudex/Caudex-Regular.ttf'),
    CaudexBold: require('../../../assets/fonts/Caudex/Caudex-Bold.ttf'),
    CaudexItalic: require('../../../assets/fonts/Caudex/Caudex-Italic.ttf'),
    CaudexBoldItalic: require('../../../assets/fonts/Caudex/Caudex-BoldItalic.ttf'),
  });

  if (!loadedFonts) {
    return getDefaultFont();
  }
  switch (fontStyle) {
    case 'regular':
      return 'CaudexRegular';
    case 'bold':
      return 'CaudexBold';
    case 'italic':
      return 'CaudexItalic';
    case 'boldItalic':
      return 'CaudexBoldItalic';
    default:
      return getDefaultFont();
  }
};
