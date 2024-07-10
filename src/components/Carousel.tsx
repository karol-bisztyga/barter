import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';


const Carousel = ({ images }: { images: string[] }) => {
    const [imageIndex, setImageIndex] = useState<number>(0);

    const renderDots = () => {
        return images.map((_, index) => (
            <View
                key={index}
                style={[
                    styles.dot,
                    { backgroundColor: index === imageIndex ? 'black' : 'lightgrey' },
                ]}
            />
        ));
    };

    return (
        <>
            <View style={styles.container}>
                <Image source={{ uri: images[imageIndex] }} style={styles.image} />

                {images.length > 1 &&
                    <View style={styles.dotsContainer}>
                        {renderDots()}
                    </View>
                }

                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.leftButton}
                    onPress={() => {
                        if (imageIndex === 0) {
                            setImageIndex(images.length - 1);
                            return;
                        }
                        setImageIndex(imageIndex - 1);
                    }}
                />

                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.rightButton}
                    onPress={() => {
                        if (imageIndex >= images.length - 1) {
                            setImageIndex(0);
                            return;
                        }
                        setImageIndex(imageIndex + 1);
                    }}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        margin: 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    leftButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
    },
    rightButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 20,
    },
    image: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    dotsContainer: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20,
        width: '100%',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        margin: 5,
    },
});

export default Carousel;
