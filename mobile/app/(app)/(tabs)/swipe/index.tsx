import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import SwipeableCard from '../../components/SwipeableCard';
import { router } from 'expo-router';
import { ItemData } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { getUserItems } from '../../db_utils/getUserItems';
import { authorizeUser } from '../../utils/reusableStuff';
import { getItemsForCards } from '../../db_utils/getItemsForCards';

const LOADED_ITEMS_CAPACITY = 5;
// when there are less items loaded than this value, new items will be fetched
const ITEMS_LOAD_TRESHOLD = 3;

export default function Swipe() {
  const token = authorizeUser();

  const [cards, setCards] = useState<ItemData[]>([]);
  const lockGesture = useSharedValue<boolean>(false);
  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  useEffect(() => {
    if (!userContext.data) {
      throw new Error('user data not provided');
    }
    getUserItems(token)
      .then((items) => {
        userContext.setItems(items);
      })
      .catch((e) => {
        console.error('error', e);
      });
  }, []);

  const popAndLoadCard = async (): Promise<ItemData | null> => {
    const currentCard = cards.at(-1);
    if (currentCard === undefined) {
      return null;
    }

    // pop
    const updatedCards = [...cards.slice(0, -1)];

    if (cards.length <= ITEMS_LOAD_TRESHOLD) {
      try {
        const itemsLoaded = await getItemsForCards(token, LOADED_ITEMS_CAPACITY);
        updatedCards.push(...itemsLoaded);
      } catch (e) {
        console.error('error loading cards', e);
        return null;
      }
    }
    setCards(updatedCards);
    return currentCard;
  };

  useEffect(() => {
    (async () => {
      try {
        const itemsLoaded = await getItemsForCards(token, LOADED_ITEMS_CAPACITY);

        setCards(itemsLoaded);
      } catch (e) {
        console.error('error loading cards', e);
      }
    })();
  }, []);

  useEffect(() => {
    // printCards();
    console.log('> cards updated', cards.length);
  }, [cards]);

  const handleSwipeRight = async () => {
    const swipedCard = await popAndLoadCard();
    console.log('Swiped Right:', swipedCard?.name);
    lockGesture.value = false;
    // todo condition here
    itemsContext.setOthersItem(swipedCard);
    router.push('swipe/match');
  };

  const handleSwipeLeft = async () => {
    const swipedCard = await popAndLoadCard();
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
              itemData={card}
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
