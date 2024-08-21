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
import { addLike } from '../../db_utils/addLike';
import { showError, showInfo } from '../../utils/notifications';

const LOADED_ITEMS_CAPACITY = 5;
// when there are less items loaded than this value, new items will be fetched
const ITEMS_LOAD_TRESHOLD = 3;

export default function Swipe() {
  const sessionContext = authorizeUser();

  const [cards, setCards] = useState<ItemData[]>([]);
  const [emptyCardsResponseReceived, setEmptyCardsResponseReceived] = useState<boolean>(false);
  const lockGesture = useSharedValue<boolean>(false);
  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  useEffect(() => {
    if (!userContext.data) {
      showError(
        'your session seems to be corrupted (your data is missing), you may want to restart the app or log in again'
      );
      return;
    }
    getUserItems(sessionContext)
      .then((items) => {
        userContext.setItems(items);
      })
      .catch((e) => {
        console.error('error', e);
        if (!`${e}`.includes('Invalid token')) {
          showError(`error loading user's items`);
        }
      });
  }, []);

  const popAndLoadCard = async (): Promise<ItemData | null> => {
    const currentCard = cards.at(-1);
    if (currentCard === undefined) {
      return null;
    }

    // pop
    let updatedCards = [...cards.slice(0, -1)];

    if (cards.length <= ITEMS_LOAD_TRESHOLD) {
      try {
        if (emptyCardsResponseReceived) {
          showInfo('no items available for now, try again later');
          return currentCard;
        }
        const itemsLoaded = await getItemsForCards(
          sessionContext,
          cards.map((card) => card.id),
          LOADED_ITEMS_CAPACITY
        );
        if (!itemsLoaded.length) {
          setEmptyCardsResponseReceived(true);
          return currentCard;
        }
        updatedCards = [...itemsLoaded, ...updatedCards];
      } catch (e) {
        if (!`${e}`.includes('Invalid token')) {
          showError('error loading cards');
        }
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
        if (emptyCardsResponseReceived) {
          showInfo('no items available for now, try again later');
          return;
        }
        const itemsLoaded = await getItemsForCards(
          sessionContext,
          cards.map((card) => card.id),
          LOADED_ITEMS_CAPACITY
        );
        if (!itemsLoaded.length) {
          setEmptyCardsResponseReceived(true);
          return;
        }

        setCards(itemsLoaded);
      } catch (e) {
        if (!`${e}`.includes('Invalid token')) {
          showError('error loading cards');
        }
        console.error('error loading cards initially', e);
      }
    })();
  }, []);

  const sendLike = async (likedItemId: string, decision: boolean) => {
    try {
      return await addLike(sessionContext, likedItemId, decision);
    } catch (e) {
      if (!`${e}`.includes('Invalid token')) {
        showError('error sending like');
      }
      console.error('error sending like', e);
    }
  };

  const handleSwipeRight = async () => {
    if (userContext.swipingLeftRightBlockedReason) {
      showInfo('swiping left/right blocked, reason:', userContext.swipingLeftRightBlockedReason);
      return;
    }
    const swipedCard = await popAndLoadCard();
    if (!swipedCard) {
      showError('could not find swiped card');
      return;
    }
    const sendLikeResult = await sendLike(swipedCard.id, true);
    lockGesture.value = false;

    if (sendLikeResult.matchStatus === 'match') {
      itemsContext.setUsersItemId(sendLikeResult.matchResult.matching_item_id);
      itemsContext.setOthersItem(swipedCard);
      itemsContext.setUsersItemsLikedByTargetItemOwner(
        sendLikeResult.myItemsLikedByTargetItemOwner
      );
      router.push('swipe/match');
    }
  };

  const handleSwipeLeft = async () => {
    if (userContext.swipingLeftRightBlockedReason) {
      showInfo('swiping left/right blocked, reason:', userContext.swipingLeftRightBlockedReason);
      return;
    }
    const swipedCard = await popAndLoadCard();
    if (!swipedCard) {
      showError('could not find swiped card');
      return;
    }
    const sendLikeResult = await sendLike(swipedCard.id, false);
    lockGesture.value = false;
    if (sendLikeResult.matchStatus === 'match') {
      showError(
        `something went terribly wrong, it's a match even though the user disliked this item! This should never happen!`
      );
      return;
    }
  };

  const handleSwipeDown = async () => {
    const swipedCard = await popAndLoadCard();
    if (!swipedCard) {
      showError('could not find swiped card');
      return;
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          {cards.map((card, index) => (
            <SwipeableCard
              key={`${card.id}-${index}`}
              itemData={card}
              swipeCallbacks={{
                onSwipeRight: handleSwipeRight,
                onSwipeLeft: handleSwipeLeft,
                onSwipeDown: handleSwipeDown,
              }}
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
