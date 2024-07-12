import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { generateItem } from '../../mocks/itemsMocker';
import SwipeableCard from '../../components/SwipeableCard';
import { router } from 'expo-router';

const LOADED_ITEMS_CAPACITY = 5;

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentId, setCurrentId] = useState<number>(0);
  const lockGesture = useSharedValue<boolean>(false);

  const printCards = () => {
    console.log(
      '> cards',
      cards.map((card) => card.name)
    );
  };

  const useCurrentId = () => {
    const id = currentId;
    setCurrentId(currentId + 1);
    return id;
  };

  const popAndLoadCard = (): Card | null => {
    const currentCard = cards.at(-1);
    if (currentCard === undefined) {
      return null;
    }
    setCards([generateItem(useCurrentId()), ...cards.slice(0, -1)]);
    return currentCard;
  };

  useEffect(() => {
    const newItems = [];
    let id = currentId;
    for (let i = 0; i < LOADED_ITEMS_CAPACITY; ++i) {
      newItems.push(generateItem(id++));
    }
    setCurrentId(id);
    setCards(newItems);
  }, []);

  useEffect(() => {
    printCards();
  }, [cards]);

  const handleSwipeRight = () => {
    const swipedCard = popAndLoadCard();
    console.log('Swiped Right:', swipedCard?.name);
    lockGesture.value = false;
    // todo condition here
    router.push({
      pathname: 'swipe/match',
      params: {
        matchedItemId: swipedCard?.id,
        matchedItemName: swipedCard?.name,
        matchedItemImages: swipedCard?.images,
        matchedItemDescription: swipedCard?.description,
      },
    });
  };

  const handleSwipeLeft = () => {
    const swipedCard = popAndLoadCard();
    console.log('Swiped Left:', swipedCard?.name);
    lockGesture.value = false;
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {cards.map((card, index) => (
          <SwipeableCard
            key={`${card.id}-${index}`}
            card={card}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            lockGesture={lockGesture}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
