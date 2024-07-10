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
    useDerivedValue,
} from 'react-native-reanimated';
import { Card } from '../../app/index';
import Carousel from './Carousel';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;
const MAX_RADIUS = 30;

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
    const dragging = useSharedValue(false);

    const gesture = Gesture.Pan()
        .onBegin(() => {
            translateX.value = 0;
            translateY.value = 0;
            rotate.value = '0deg';
        })
        .onUpdate((event) => {
            dragging.value = true;
            translateX.value = event.translationX;

            console.log('drag', translateX.value);

            translateY.value = event.translationY;
            velocityX.value = event.velocityX;
            velocityY.value = event.velocityY;
            rotate.value = `${translateX.value / 20}deg`;
        })
        .onEnd(() => {
            dragging.value = false;
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

    const radius = useDerivedValue(() => {
        const tx = Math.abs(translateX.value);
        if (tx > SWIPE_THRESHOLD) {
            return MAX_RADIUS;
        }
        // x - tx
        // 20 - treshold
        // x = tx/treshold*20
        return tx / SWIPE_THRESHOLD * MAX_RADIUS

    });

    const shadowColor = useDerivedValue(() => {
        if (!dragging.value) {
            return 'black';
        }
        return translateX.value > 0 ? 'green' : 'red'
    })

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: rotate.value },
            ],
            shadowRadius: dragging.value ? radius.value : 1,
            shadowColor: shadowColor.value,
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
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        // shadowRadius: 5,
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
