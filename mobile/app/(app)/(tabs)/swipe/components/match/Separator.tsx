import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { GOLD_COLOR_1, GOLD_COLOR_2 } from '../../../../constants';

const SQUARE_SIZE = 16;
const SQUARE_STROKE_WIDTH = 2;

type SeparatorProps = {
  marginTop: number;
};

export const Separator = ({ marginTop }: SeparatorProps) => {
  return (
    <View style={[styles.container, { marginTop: marginTop + 11 }]}>
      <View style={styles.line}>
        <LinearGradient
          colors={[GOLD_COLOR_1, GOLD_COLOR_2, GOLD_COLOR_1]}
          locations={[0, 0.47, 1]}
          style={styles.gradient}
        />

        <View style={styles.squareBorder}>
          <LinearGradient
            colors={[GOLD_COLOR_1, GOLD_COLOR_2, GOLD_COLOR_1]}
            locations={[0, 0.47, 1]}
            style={styles.gradient}
          />
          <View style={styles.squareFill} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center' },
  line: { width: 185, height: 2, alignItems: 'center' },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  squareBorder: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    transform: [{ rotate: '45deg' }],
    top: -7,
  },
  squareFill: {
    position: 'absolute',
    top: SQUARE_STROKE_WIDTH / 2,
    left: SQUARE_STROKE_WIDTH / 2,
    backgroundColor: 'black',
    width: SQUARE_SIZE - SQUARE_STROKE_WIDTH,
    height: SQUARE_SIZE - SQUARE_STROKE_WIDTH,
  },
});
