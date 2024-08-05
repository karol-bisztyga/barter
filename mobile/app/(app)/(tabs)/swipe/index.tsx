import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import SwipeableCard from '../../components/SwipeableCard';
import { router } from 'expo-router';
import { Card } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { generateItem } from '../../mocks/itemsMocker';
import { getUserItems } from '../../db_utils/getUserItems';
import { authorizeUser } from '../../utils/reusableStuff';

const LOADED_ITEMS_CAPACITY = 5;

export default function Swipe() {
  const token = authorizeUser();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentId, setCurrentId] = useState<number>(0);
  const lockGesture = useSharedValue<boolean>(false);
  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  useEffect(() => {
    if (!userContext.data) {
      throw new Error('user data not provided');
    }
    getUserItems(userContext.data.id, token)
      .then((items) => {
        userContext.setItems(items);
      })
      .catch((e) => {
        console.error('error', e);
      });
  }, []);

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
    // printCards();
  }, [cards]);

  const handleSwipeRight = () => {
    const swipedCard = popAndLoadCard();
    console.log('Swiped Right:', swipedCard?.name);
    lockGesture.value = false;
    // todo condition here
    itemsContext.setOthersItem(swipedCard);
    router.push('swipe/match');
  };

  const handleSwipeLeft = () => {
    const swipedCard = popAndLoadCard();
    console.log('Swiped Left:', swipedCard?.name);
    lockGesture.value = false;
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          {cards.map((card, index) => (
            <SwipeableCard
              key={`${card.id}-${index}`}
              card={card}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              lockGesture={lockGesture}
              onPressMore={() => {
                itemsContext.setOthersItem(card);
                router.push({ pathname: 'swipe/item', params: { whosItem: 'other' } });
              }}
            />
          ))}
        </View>
      </SafeAreaView>
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
