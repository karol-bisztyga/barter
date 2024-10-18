import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { showInfo } from '../../../../../utils/notifications';
import TextWrapper from '../../../../../genericComponents/TextWrapper';

export type SelectEditingPanelProps = {
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setEditingIndex: React.Dispatch<React.SetStateAction<number | null>>;
  options: string[];
};

const SelectEditingPanel = ({
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setEditingIndex,
  options,
}: SelectEditingPanelProps) => {
  const maxHeight = 60 * options.length;

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

  if (!options.length || !options.includes(initialValue)) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, wrapperAnimatedStyle]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionWrapper,
            { backgroundColor: editingValue === option ? '#ccc' : 'transparent' },
          ]}
          disabled={editingValue === option}
          onPress={() => {
            showInfo('other languages are not yet implemented');
            setEditingIndex(null);
          }}
        >
          <TextWrapper>{option}</TextWrapper>
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
  },
});

export default SelectEditingPanel;
