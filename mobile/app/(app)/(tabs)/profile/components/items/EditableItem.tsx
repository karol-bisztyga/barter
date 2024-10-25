import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import TextWrapper from '../../../../genericComponents/TextWrapper';
import FieldEditingPanel from './editing_panels/FieldEditingPanel';
import LocationEditingPanel from './editing_panels/LocationEditingPanel';
import SelectEditingPanel from './editing_panels/SelectEditingPanel';
import PasswordEditingPanel from './editing_panels/PasswordEditingPanel';

export type EditingPanelType = 'field' | 'location' | 'select' | 'password';

const EditableItem = ({
  name,
  initialValue,
  id,
  isLast,
  editingId,
  setEditingId,
  editable = true,
  type = 'field',
  options,
}: {
  name: string;
  initialValue: string;
  id: string;
  isLast: boolean;
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  editable: boolean;
  type: EditingPanelType;
  options?: string[]; // only for type 'select'
}) => {
  const [value, setValue] = useState(initialValue);
  const [editingValue, setEditingValue] = useState(value);
  const [pageY, setPageY] = useState(0);
  const viewRef = useRef<View>(null);

  const editing = useSharedValue(0);

  const formatItemName = (name: string) => {
    if (name === 'userLocationCity') {
      return 'location';
    }
    return name;
  };

  const composeIdWithPageY = () => `${id}-${pageY}`;

  useEffect(() => {
    const isBeingEdited = editingId === composeIdWithPageY();
    if (isBeingEdited) {
      editing.value = withTiming(1);
    } else if (editing.value === 1) {
      editing.value = withTiming(0);
    }
  }, [editingId]);

  const rotationAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(editing.value, [0, 1], [0, 90])}deg`,
        },
      ],
    };
  });

  const toggleEdit = () => {
    if (!editable) {
      return;
    }

    if (editingId === composeIdWithPageY()) {
      setEditingId('');
    } else {
      setEditingId(composeIdWithPageY());
    }
  };

  const renderEditingPanel = () => {
    switch (type) {
      case 'field':
        return (
          <FieldEditingPanel
            editing={editing}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            name={name}
            initialValue={initialValue}
            setValue={setValue}
            setEditingId={setEditingId}
          />
        );
      case 'location':
        return (
          <LocationEditingPanel
            editing={editing}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            name={name}
            initialValue={initialValue}
            setValue={setValue}
            setEditingId={setEditingId}
          />
        );
      case 'select':
        return (
          <SelectEditingPanel
            editing={editing}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            initialValue={initialValue}
            setEditingId={setEditingId}
            options={options || []}
          />
        );
      case 'password':
        return (
          <PasswordEditingPanel
            editing={editing}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            name={name}
            initialValue={initialValue}
            setValue={setValue}
            setEditingId={setEditingId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      onLayout={() => {
        if (viewRef.current !== null) {
          viewRef.current.measure((_x, _y, _width, _height, _pageX, measuredPageY) => {
            if (!pageY && measuredPageY) {
              setPageY(measuredPageY);
            }
          });
        }
      }}
      ref={viewRef}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            borderBottomWidth: isLast ? 0 : 1,
          },
        ]}
        key={id}
        onLongPress={async () => {
          await Clipboard.setStringAsync(value);
          Alert.alert('Copied to Clipboard', value);
        }}
        onPress={toggleEdit}
      >
        <TextWrapper style={styles.itemTitle}>{formatItemName(name)}</TextWrapper>
        <TextWrapper style={[styles.itemValue]}>{value}</TextWrapper>
        <View style={[styles.itemArrowWrapper, { opacity: editable ? 1 : 0 }]}>
          <Animated.View style={rotationAnimatedStyle}>
            <FontAwesome size={18} style={styles.itemArrow} name="chevron-right" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {renderEditingPanel()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  itemTitle: {
    fontSize: 18,
    lineHeight: 60,
    marginLeft: 10,
  },
  itemValue: {
    flex: 1,
    fontSize: 18,
    lineHeight: 60,
    textAlign: 'right',
  },
  itemArrowWrapper: {
    textAlign: 'right',
    height: 60,
    lineHeight: 60,
    width: 16,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemArrow: {
    width: 16,
    height: 16,
    textAlign: 'center',
  },
});

export default EditableItem;
