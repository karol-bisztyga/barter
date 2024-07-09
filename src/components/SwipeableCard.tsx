// SwipeableCard.js

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Card } from '../../app/index';
import Carousel from './Carousel';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

const SwipeableCard = ({
  card,
  onSwipeRight,
  onSwipeLeft,
}: {
  card: Card;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const rotate = useSharedValue('0deg');

  const gesture = Gesture.Pan()
    .onBegin(() => {
      translateX.value = 0;
      translateY.value = 0;
      rotate.value = '0deg';
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      velocityX.value = event.velocityX;
      velocityY.value = event.velocityY;
      rotate.value = `${translateX.value / 20}deg`;
    })
    .onEnd(() => {
      console.log('VX', velocityX.value);
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(onSwipeRight)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring('0deg');
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: rotate.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageWrapper}
          onPress={(e) => {
            console.log('press', e.nativeEvent.locationX);
          }}
        >
          <Carousel images={card.images} />
        </TouchableOpacity>
        <View style={styles.nameWrapper}>
          <Text style={styles.name}>{card.name}</Text>
        </View>
        <ScrollView style={styles.descriptionWrapper}>
          <Text style={styles.description}>{card.description}</Text>
        </ScrollView>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  imageWrapper: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  nameWrapper: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  descriptionWrapper: {
    margin: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 20,
    color: 'gray',
  },
});

export default SwipeableCard;
