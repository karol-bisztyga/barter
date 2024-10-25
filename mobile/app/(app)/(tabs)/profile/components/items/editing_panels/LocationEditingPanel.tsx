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
import ButtonWrapper from '../../../../../genericComponents/ButtonWrapper';
import { showSuccess } from '../../../../../utils/notifications';
import { cityNameFromLocation, sleep } from '../../../../../utils/reusableStuff';
import { FieldEditingPanelProps } from './FieldEditingPanel';

const LocationEditingPanel = ({
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setValue,
  setEditingId,
}: FieldEditingPanelProps) => {
  const sessionContext = useSessionContext();
  const userContext = useUserContext();

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, 60]),
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
      await sleep(2000);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error(
          'Permission to access location was denied, you may need to enable location services in settings'
        );
      }

      return await Location.getCurrentPositionAsync({});
    } catch (e) {
      handleError(ErrorType.GET_LOCATION, `${e}`);
    }
  };

  const update = async () => {
    try {
      userContext.setBlockingLoading(true);
      const location = await obtainLocation();

      if (!location) {
        throw new Error('could not obtain location');
      }

      const city = await cityNameFromLocation(formatLocationCoords(location.coords));
      await updateUser(sessionContext, [
        { field: 'location_coordinate_lat', value: `${location?.coords.latitude}` },
        { field: 'location_coordinate_lon', value: `${location?.coords.longitude}` },
        { field: 'location_city', value: city },
      ]);

      const obj: Partial<UserData> = {
        userLocationCoordinates: formatLocationCoords(location.coords),
        userLocationCity: city,
      };
      setValue(city);
      userContext.setData({ ...userContext.data, ...obj } as UserData);

      setEditingId('');

      showSuccess(`location updated`);
    } catch (e) {
      handleError(ErrorType.UPDATE_USER, `${e}`);
    } finally {
      userContext.setBlockingLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, wrapperAnimatedStyle]}>
      <View style={styles.editingInputWrapper}>
        <InputWrapper
          style={styles.editingInput}
          placeholder="new value"
          value={editingValue}
          onChangeText={(text) => {
            setEditingValue(text);
          }}
          editable={false}
          fillColor="#F5F5F5"
        />
      </View>
      <View style={styles.updateButtonWrapper}>
        <ButtonWrapper title="Update" onPress={update} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  editingInputWrapper: {
    flex: 3,
    height: 60,
  },
  editingInput: {},
  updateButtonWrapper: {
    flex: 1,
  },
});

export default LocationEditingPanel;
