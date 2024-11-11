import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  Easing,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import TextWrapper from '../../../../genericComponents/TextWrapper';
import FieldEditingPanel from './editing_panels/FieldEditingPanel';
import LocationEditingPanel from './editing_panels/LocationEditingPanel';
import SelectEditingPanel, { SelectConfig } from './editing_panels/SelectEditingPanel';
import PasswordEditingPanel from './editing_panels/PasswordEditingPanel';
import { FONT_COLOR } from '../../../../constants';
import { useTranslation } from 'react-i18next';

export type EditingPanelType = 'field' | 'location' | 'select' | 'password';

type EditableItemProps = {
  name: string;
  displayName: string;
  initialValue: string;
  id: string;
  isLast: boolean;
  editingId: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  editable: boolean;
  type: EditingPanelType;
  selectConfig?: SelectConfig; // only for type 'select'
};

const EditableItem = ({
  name,
  displayName,
  initialValue,
  id,
  isLast,
  editingId,
  setEditingId,
  editable = true,
  type = 'field',
  selectConfig,
}: EditableItemProps) => {
  const { t } = useTranslation();

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

    const timingConfig = {
      duration: 300,
      easing: Easing.exp,
      reduceMotion: ReduceMotion.System,
    };

    if (isBeingEdited) {
      editing.value = withTiming(1, timingConfig);
    } else {
      editing.value = withTiming(0, timingConfig);
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
    if (editing.value !== 0 && editing.value !== 1) {
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
            displayName={displayName}
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
            initialValue={initialValue}
            setValue={setValue}
            setEditingId={setEditingId}
          />
        );
      case 'select':
        if (!selectConfig) {
          return null;
        }
        return (
          <SelectEditingPanel
            editing={editing}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            initialValue={initialValue}
            setEditingId={setEditingId}
            selectConfig={selectConfig}
            setValue={setValue}
          />
        );
      case 'password':
        return <PasswordEditingPanel editing={editing} setEditingId={setEditingId} />;
      default:
        return null;
    }
  };

  let label = value;
  if (type === 'select' && selectConfig) {
    label = selectConfig.valueFormatter(value);
  }

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
          Alert.alert(t('copied_to_clipboard'), value);
        }}
        onPress={toggleEdit}
      >
        <TextWrapper style={styles.itemTitle}>{formatItemName(displayName)}</TextWrapper>
        <TextWrapper style={[styles.itemValue]}>{label}</TextWrapper>
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
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemArrow: {
    width: 16,
    height: 16,
    textAlign: 'center',
    color: FONT_COLOR,
  },
});

export default EditableItem;
