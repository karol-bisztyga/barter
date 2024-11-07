import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import TextWrapper from '../../../../../genericComponents/TextWrapper';
import { useJokerContext } from '../../../../../context/JokerContext';
import { EDITING_PANEL_HEIGHT, SECTION_BACKGROUND } from './constants';
import { useTranslation } from 'react-i18next';

export type SelectEditingPanelProps = {
  initialValue: string;
  editing: SharedValue<number>;
  editingValue: string;
  setEditingValue: React.Dispatch<React.SetStateAction<string>>;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  options: string[];
};

const SelectEditingPanel = ({
  initialValue,
  editing,
  editingValue,
  setEditingValue,
  setEditingId,
  options,
}: SelectEditingPanelProps) => {
  const { t } = useTranslation();

  const jokerContext = useJokerContext();

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
          onPress={() => {
            if (editingValue !== option) {
              jokerContext.showInfo(t('profile_language_not_supported'));
            }
            setEditingId('');
          }}
        >
          <TextWrapper style={styles.label}>{option}</TextWrapper>
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
  },
  label: {
    fontSize: 20,
  },
});

export default SelectEditingPanel;
