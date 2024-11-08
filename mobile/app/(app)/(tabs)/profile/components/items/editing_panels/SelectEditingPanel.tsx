import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import TextWrapper from '../../../../../genericComponents/TextWrapper';
import { EDITING_PANEL_HEIGHT, SECTION_BACKGROUND } from './constants';
import { SvgProps } from 'react-native-svg';

export type SelectConfig = {
  options: {
    value: string;
    label: string;
    Icon: React.FC<SvgProps> | null;
  }[];
  onSelect: (value: string) => boolean;
  valueFormatter: (value: string) => string;
};

export type SelectEditingPanelProps = {
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  selectConfig: SelectConfig;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

const SelectEditingPanel = ({
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  selectConfig,
  setValue,
}: SelectEditingPanelProps) => {
  const { options } = selectConfig;

  const maxHeight = EDITING_PANEL_HEIGHT * options.length;

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(editing.value, [0, 1], [0, maxHeight]),
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
  const optionsIncludeInitialValue = options.some(({ value }) => {
    return value === initialValue;
  });

  if (!options.length || !optionsIncludeInitialValue) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, wrapperAnimatedStyle]}>
      {options.map(({ label, value, Icon }, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionWrapper,
            { backgroundColor: editingValue === value ? '#ccc' : 'transparent' },
          ]}
          onPress={() => {
            const select = selectConfig.onSelect(value);
            if (select) {
              setValue(value);
            }
          }}
        >
          <View style={styles.innerWrapper}>
            {Icon && <Icon width={20} height={20} style={styles.icon} />}
            <TextWrapper style={styles.label}>{label}</TextWrapper>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'column',
    backgroundColor: SECTION_BACKGROUND,
  },
  editingInputWrapper: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 30,
    height: 40,
  },
  optionWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  label: {
    fontSize: 20,
  },
  icon: { marginHorizontal: 8 },
  innerWrapper: { flexDirection: 'row' },
});

export default SelectEditingPanel;
