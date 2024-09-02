import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { SessionContextState, useSessionContext } from '../../SessionContext';
import { getUserMatches } from '../db_utils/getUserMatches';
import { MatchContextState } from '../context/MatchContext';
import { XMLParser } from 'fast-xml-parser';

export const headerBackButtonOptions = (
  beforeCallback?: () => Promise<boolean>,
  disabled: boolean = false
) => {
  return {
    headerShown: true,
    headerTitle: () => <></>,
    headerBackVisible: false,
    headerLeft: () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={async () => {
          if (beforeCallback && !(await beforeCallback())) {
            return;
          }
          if (disabled) {
            return;
          }
          router.back();
        }}
        disabled={disabled}
        style={{ opacity: disabled ? 0.2 : 1 }}
      >
        <FontAwesome size={28} name="arrow-left" />
      </TouchableOpacity>
    ),
  };
};

export const authorizeUser = (): SessionContextState => {
  const sessionContext = useSessionContext();
  if (!sessionContext.session) {
    throw new Error('Unauthorized access'); // todo this error is not handled
  }
  return sessionContext;
};

export const updateMatches = async (
  sessionContext: SessionContextState,
  matchContext: MatchContextState
) => {
  const matchesResult = await getUserMatches(sessionContext, matchContext.localDateUpdated);
  const { matches, dateUpdated } = matchesResult;
  if (matches) {
    matchContext.setMatches(matches);
  }
  matchContext.setLocalDateUpdated(dateUpdated);
};

export const formatLocation = async (locationStr?: string) => {
  if (!locationStr) {
    return '';
  }
  return (await cityNameFromLocation(locationStr)) || locationStr || '';
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
