import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserData } from '../../../../../types';
import { useUserContext } from '../../../../../context/UserContext';
import { useSessionContext } from '../../../../../../SessionContext';
import { updateUser } from '../../../../../db_utils/updateUser';
import { ErrorType, handleError } from '../../../../../utils/errorHandler';
import InputWrapper from '../../../../../genericComponents/InputWrapper';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import ButtonWrapper from '../../../../../genericComponents/ButtonWrapper';
import {
  capitalizeFirstLetterOfEveryWord,
  cityNameFromLocation,
} from '../../../../../utils/reusableStuff';
import { useJokerContext } from '../../../../../context/JokerContext';
import { EDITING_PANEL_HEIGHT, SECTION_BACKGROUND } from './constants';
import { useTranslation } from 'react-i18next';
import { BLACK_COLOR, BROWN_COLOR_4 } from '../../../../../constants';

export type LocationEditingPanelProps = {
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
};

const LocationEditingPanel = ({
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setValue,
  setEditingId,
}: LocationEditingPanelProps) => {
  const { t } = useTranslation();

  const sessionContext = useSessionContext();
  const userContext = useUserContext();
  const jokerContext = useJokerContext();

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, EDITING_PANEL_HEIGHT]),
    };
  });

  useAnimatedReaction(
    () => editing.value,
    (value) => {
      if (value === 0) {
        runOnJS(setEditingValue)(initialValue);
      }
    }
  );

  const formatLocationCoords = (location: Location.LocationObjectCoords) =>
    `${location.latitude}, ${location.longitude}`;

  const obtainLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        handleError(
          t,
          jokerContext,
          ErrorType.LOCATION_PERMISSION_DENIED,
          'Permission to access location was denied, you may need to enable location services in settings'
        );
        return null;
      }

      return await Location.getCurrentPositionAsync({});
    } catch (e) {
      handleError(t, jokerContext, ErrorType.GET_LOCATION, `${e}`);
    }
  };

  const update = async () => {
    try {
      userContext.setBlockingLoading(true);
      const location = await obtainLocation();

      if (!location) {
        userContext.setBlockingLoading(false);
        return;
      }

      const city = await cityNameFromLocation(formatLocationCoords(location.coords));

      const updates = [
        { field: 'location_coordinate_lat', value: `${location?.coords.latitude}` },
        { field: 'location_coordinate_lon', value: `${location?.coords.longitude}` },
      ];
      const contextUpdates: Partial<UserData> = {
        userLocationCoordinates: formatLocationCoords(location.coords),
      };
      let jokerMessage = t('profile_location_updated');

      if (city && !city.includes('undefined')) {
        updates.push({ field: 'location_city', value: city });
        contextUpdates.userLocationCity = city;
        setValue(city);
      } else {
        jokerMessage += ' ' + t('profile_city_could_not_be_determined');
      }

      await updateUser(sessionContext, updates);
      userContext.setData({ ...userContext.data, ...contextUpdates } as UserData);

      setEditingId('');

      jokerContext.showSuccess(jokerMessage);
    } catch (e) {
      handleError(t, jokerContext, ErrorType.UPDATE_USER, `${e}`);
    } finally {
      userContext.setBlockingLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, wrapperAnimatedStyle]}>
      <View style={styles.editingInputWrapper}>
        <InputWrapper
          style={styles.editingInput}
          value={editingValue}
          editable={false}
          fillColor={SECTION_BACKGROUND}
        />
      </View>
      <View style={styles.updateButtonWrapper}>
        <ButtonWrapper
          title={capitalizeFirstLetterOfEveryWord(t('locate'))}
          onPress={update}
          mode="red"
          frameMode="single"
          marginTop={12}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    borderColor: BROWN_COLOR_4,
    borderBottomWidth: 1,
  },
  editingInputWrapper: {
    flex: 3,
    height: 52,
    marginLeft: 20,
    marginRight: 10,
    marginTop: 16,
  },
  editingInput: {
    color: BLACK_COLOR,
    fontSize: 14,
    paddingVertical: 14,
  },
  updateButtonWrapper: {
    flex: 1,
    marginTop: 14,
    marginRight: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LocationEditingPanel;
