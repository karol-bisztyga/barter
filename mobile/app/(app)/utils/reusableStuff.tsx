import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { XMLParser } from 'fast-xml-parser';
import { UserData } from '../types';
import { LisIcon, PolandFlagIcon, UkraineFlagIcon, UnitedKingdomFlagIcon } from './icons';
import { useSettingsContext } from '../context/SettingsContext';
import { SvgProps } from 'react-native-svg';
import Background from '../components/Background';

export const headerBackButtonOptions = (
  beforeCallback?: () => Promise<boolean>,
  disabled: boolean = false
) => {
  const settingsContext = useSettingsContext();

  return {
    headerShown: true,
    headerTitle: () => <></>,
    headerBackVisible: false,
    headerBackground: () => (
      <View style={{ backgroundColor: 'black', width: '100%', height: '100%' }}>
        <Background tile="main" />
      </View>
    ),
    headerLeft: () => (
      <TouchableOpacity
        onPress={async () => {
          if (beforeCallback && !(await beforeCallback())) {
            return;
          }
          if (disabled) {
            return;
          }
          settingsContext.playSound('click');
          router.back();
        }}
        disabled={disabled}
        style={{
          opacity: disabled ? 0.2 : 1,
        }}
      >
        <LisIcon
          width={28}
          height={28}
          style={{
            transform: [{ rotate: '-90deg' }],
          }}
        />
      </TouchableOpacity>
    ),
  };
};

export const formatLocation = async (userData: UserData | null): Promise<string> => {
  if (userData?.userLocationCity) {
    return userData.userLocationCity;
  }
  if (!userData?.userLocationCoordinates) {
    return await cityNameFromLocation(userData?.userLocationCoordinates);
  }
  return '';
};

export const cityNameFromLocation = async (location?: string) => {
  if (!location) {
    return '';
  }
  const locationParts = location.split(',');
  try {
    const cityNameDeduced = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${locationParts[0].trim()}&lon=${locationParts[1].trim()}`
    );
    const fetchedXml = await cityNameDeduced.text();
    const parsedXml = new XMLParser().parse(fetchedXml);
    return `${parsedXml.reversegeocode.addressparts.city}, ${parsedXml.reversegeocode.addressparts.country}`;
  } catch (e) {
    return '';
  }
};

export const getDistanceFromLatLonInKm = (coords1: string, coords2: string) => {
  const [lat1, lon1] = coords1.split(',').map((x) => parseFloat(x));
  const [lat2, lon2] = coords2.split(',').map((x) => parseFloat(x));

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024; // 1 KB = 1024 bytes
  const dm = decimals < 0 ? 0 : decimals; // Ensure decimals is non-negative
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; // Standard units

  const i = Math.floor(Math.log(bytes) / Math.log(k)); // Determine unit

  // Calculate the size and return formatted string
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const sleep = async (ms: number = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
};

export const getUserLocation = (userData: UserData | null) => {
  if (!userData) {
    return '';
  }
  userData.userLocationCoordinates || userData.userLocationCity;
};

export const getIconForLanguage = (language: string): React.FC<SvgProps> | null => {
  switch (language) {
    case 'language_english':
      return UnitedKingdomFlagIcon;
    case 'language_polish':
      return PolandFlagIcon;
    case 'language_ukrainian':
      return UkraineFlagIcon;
  }
  return null;
};

export const capitalizeFirstLetterOfEveryWord = (text: string) =>
  text
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

// spread is not supported in react native
export const convertFigmaShadowToReactNative = ({
  x,
  y,
  blur,
  // spread,
  color,
  opacity,
}: {
  x: number;
  y: number;
  blur: number;
  // spread: number;
  color: string;
  opacity: number;
}) => {
  return {
    shadowColor: color,
    shadowOffset: { width: x, height: y },
    shadowOpacity: opacity, // Convert percentage to decimal
    shadowRadius: blur, // Blur maps directly to shadowRadius
    elevation: Math.max(y, blur / 2), // Approximation for Android shadow
  };
};
