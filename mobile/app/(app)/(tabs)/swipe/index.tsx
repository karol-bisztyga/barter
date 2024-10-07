import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import SwipeableCard from '../../components/SwipeableCard';
import { router } from 'expo-router';
import { ItemData, SwipeDirection } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { getUserItems } from '../../db_utils/getUserItems';
import { authorizeUser } from '../../utils/reusableStuff';
import { getItemsForCards } from '../../db_utils/getItemsForCards';
import { addLike } from '../../db_utils/addLike';
import { showError, showInfo } from '../../utils/notifications';
import { ErrorType, handleError } from '../../utils/errorHandler';
import { executeProtectedQuery } from '../../db_utils/executeProtectedQuery';
import TextWrapper from '../../genericComponents/TextWrapper';
import SwipeBackgroundAnimation from '../../components/SwipeBackgroundAnimation';

const LOADED_ITEMS_CAPACITY = 5;
// when there are less items loaded than this value, new items will be fetched
const ITEMS_LOAD_TRESHOLD = 3;

export default function Swipe() {
  const sessionContext = authorizeUser();

  const [cards, setCards] = useState<ItemData[]>([]);
  const [emptyCardsResponseReceived, setEmptyCardsResponseReceived] = useState<boolean>(false);

  const lockGesture = useSharedValue<boolean>(false);
  const swipeDirection = useSharedValue<SwipeDirection | null>(null);

  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  useEffect(() => {
    (async () => {
      try {
        const userData = userContext.data;
        if (!userData || userData.onboarded) {
          return;
        }
        userContext.setData({ ...userData, onboarded: 'true' });
        await executeProtectedQuery(sessionContext, 'user/onboarded', 'PUT', null, {
          onboarded: 'true',
        });
      } catch (e) {
        showError('error updating onboarding data');
        console.error('error updating onboarding data', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userContext.data) {
      handleError(
        ErrorType.CORRUPTED_SESSION,
        'your session seems to be corrupted (your data is missing), you may want to restart the app or log in again'
      );
      return;
    }
    getUserItems(sessionContext)
      .then((items) => {
        userContext.setItems(items);
      })
      .catch((e) => {
        handleError(ErrorType.LOAD_ITEMS, `${e}`);
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
          LOADED_ITEMS_CAPACITY,
          userContext.data?.location
        );
        if (!itemsLoaded.length) {
          setEmptyCardsResponseReceived(true);
          return currentCard;
        }
        updatedCards = [...itemsLoaded, ...updatedCards];
      } catch (e) {
        handleError(ErrorType.LOAD_CARDS, `${e}`);
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
        userContext.setBlockingLoading(true);
        const itemsLoaded = await getItemsForCards(
          sessionContext,
          cards.map((card) => card.id),
          LOADED_ITEMS_CAPACITY,
          userContext.data?.location
        );
        if (!itemsLoaded.length) {
          setEmptyCardsResponseReceived(true);
          return;
        }

        userContext.setBlockingLoading(false);
        setCards(itemsLoaded);
      } catch (e) {
        handleError(ErrorType.LOAD_CARDS, `${e}`);
      }
    })();
  }, []);

  const sendLike = async (likedItemId: string, decision: boolean) => {
    try {
      return await addLike(sessionContext, likedItemId, decision);
    } catch (e) {
      handleError(ErrorType.SEND_LIKE, `${e}`);
    }
  };

  const handleSwipeRight = async () => {
    try {
      if (userContext.swipingLeftRightBlockedReason) {
        showInfo('swiping left/right blocked, reason:', userContext.swipingLeftRightBlockedReason);
        return;
      }
      const swipedCard = await popAndLoadCard();
      if (!swipedCard) {
        throw new Error('could not find swiped card');
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
    } catch (e) {
      handleError(ErrorType.SWIPE, `${e}`);
    }
  };

  const handleSwipeLeft = async () => {
    try {
      if (userContext.swipingLeftRightBlockedReason) {
        showInfo('swiping left/right blocked, reason:', userContext.swipingLeftRightBlockedReason);
        return;
      }
      const swipedCard = await popAndLoadCard();
      if (!swipedCard) {
        throw new Error('could not find swiped card');
      }
      const sendLikeResult = await sendLike(swipedCard.id, false);
      lockGesture.value = false;
      if (sendLikeResult.matchStatus === 'match') {
        throw new Error(
          `something went terribly wrong, it's a match even though the user disliked this item! This should never happen!`
        );
      }
    } catch (e) {
      handleError(ErrorType.SWIPE, `${e}`);
    }
  };

  const handleSwipeDown = async () => {
    try {
      const swipedCard = await popAndLoadCard();
      if (!swipedCard) {
        throw new Error('could not find swiped card');
      }
    } catch (e) {
      handleError(ErrorType.SWIPE, `${e}`);
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <SwipeBackgroundAnimation swipeDirection={swipeDirection} />
          {cards.length === 0 && !userContext.blockingLoading && (
            <View style={styles.noCardsWrapper}>
              <TextWrapper style={styles.noCardsLabel}>No more cards</TextWrapper>
            </View>
          )}
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
              cardsLength={cards.length}
              currentCardIndex={index}
              swipeDirection={swipeDirection}
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
  noCardsWrapper: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  noCardsLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.5,
  },
});
