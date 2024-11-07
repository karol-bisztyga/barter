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
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import ButtonWrapper, { BUTTON_HEIGHT } from '../../../../../genericComponents/ButtonWrapper';
import { cityNameFromLocation } from '../../../../../utils/reusableStuff';
import { FieldEditingPanelProps } from './FieldEditingPanel';
import { useJokerContext } from '../../../../../context/JokerContext';
import { EDITING_PANEL_HEIGHT, SECTION_BACKGROUND } from './constants';
import { useTranslation } from 'react-i18next';

const LocationEditingPanel = ({
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setValue,
  setEditingId,
}: FieldEditingPanelProps) => {
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

      if (city) {
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
          placeholder={editingValue}
          editable={false}
          fillColor={SECTION_BACKGROUND}
        />
      </View>
      <View style={styles.updateButtonWrapper}>
        <ButtonWrapper title={t('update')} onPress={update} fillColor={SECTION_BACKGROUND} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: SECTION_BACKGROUND,
  },
  editingInputWrapper: {
    flex: 3,
    height: 52,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  editingInput: {},
  updateButtonWrapper: {
    flex: 1,
    marginVertical: 12,
    height: BUTTON_HEIGHT,
    marginRight: 4,
  },
});

export default LocationEditingPanel;
