import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
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
import { ErrorType, handleError } from '../../utils/errorHandler';
import { executeProtectedQuery } from '../../db_utils/executeProtectedQuery';
import { useJokerContext } from '../../context/JokerContext';
import Background from '../../components/Background';
import { useSoundContext } from '../../context/SoundContext';
import Reload from './components/Reload';

const LOADED_ITEMS_CAPACITY = 5;
// when there are less items loaded than this value, new items will be fetched
const ITEMS_LOAD_TRESHOLD = 3;

export default function Swipe() {
  const sessionContext = authorizeUser();
  const soundContext = useSoundContext();

  const [cards, setCards] = useState<ItemData[]>([]);
  const [activeCard, setActiveCard] = useState<ItemData | null>(null);
  const [emptyCardsResponseReceived, setEmptyCardsResponseReceived] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const jokerContext = useJokerContext();

  const lockGesture = useSharedValue<boolean>(false);

  const itemsContext = useItemsContext();
  const userContext = useUserContext();

  // onboarding
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
        jokerContext.showError('error updating onboarding data');
        console.error('error updating onboarding data', e);
      }
    })();
  }, []);

  // load user's items
  useEffect(() => {
    if (!userContext.data) {
      handleError(
        jokerContext,
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
        handleError(jokerContext, ErrorType.LOAD_ITEMS, `${e}`);
      });
  }, []);

  // load cards initially
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const itemsLoaded: ItemData[] = await getItemsForCards(
          sessionContext,
          cards.map((card) => card.id),
          LOADED_ITEMS_CAPACITY
        );
        setLoading(false);
        if (!itemsLoaded.length) {
          setEmptyCardsResponseReceived(true);
          return;
        }

        setEmptyCardsResponseReceived(false);
        const newActiveCard = itemsLoaded.pop();
        if (!newActiveCard) {
          throw new Error('could not find active card');
        }
        setActiveCard(newActiveCard);
        setCards(itemsLoaded);
      } catch (e) {
        handleError(jokerContext, ErrorType.LOAD_CARDS, `${e}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (!emptyCardsResponseReceived || activeCard) {
      return;
    }

    jokerContext.showInfo('no items available for now, try again later');
    setEmptyCardsResponseReceived(false);
    setLoading(false);
  }, [emptyCardsResponseReceived, activeCard]);

  const popAndLoadCard = async (): Promise<ItemData | null> => {
    if (activeCard === undefined) {
      return null;
    }

    let updatedCards = [...cards];

    if (cards.length <= ITEMS_LOAD_TRESHOLD) {
      try {
        if (emptyCardsResponseReceived) {
          jokerContext.showInfo('no items available for now, try again later');
          return activeCard;
        }
        const itemsLoaded = await getItemsForCards(
          sessionContext,
          cards.map((card) => card.id),
          LOADED_ITEMS_CAPACITY
        );
        if (!itemsLoaded.length) {
          setEmptyCardsResponseReceived(true);
          return activeCard;
        }
        setEmptyCardsResponseReceived(false);
        updatedCards = [...itemsLoaded, ...updatedCards];
      } catch (e) {
        handleError(jokerContext, ErrorType.LOAD_CARDS, `${e}`);
        return null;
      }
    }
    const newActiveCard = updatedCards.pop();
    if (!newActiveCard) {
      return null;
    }
    setActiveCard(newActiveCard);
    setCards(updatedCards);
    return activeCard;
  };

  const loadCards = async () => {
    setLoading(true);
    const itemsLoaded = await getItemsForCards(
      sessionContext,
      cards.map((card) => card.id),
      LOADED_ITEMS_CAPACITY
    );
    if (!itemsLoaded.length) {
      setEmptyCardsResponseReceived(true);
    }
    setLoading(false);
  };

  const sendLike = async (likedItemId: string, decision: boolean) => {
    try {
      return await addLike(sessionContext, likedItemId, decision);
    } catch (e) {
      handleError(jokerContext, ErrorType.SEND_LIKE, `${e}`);
    }
  };

  const handleSwipeRight = async () => {
    try {
      soundContext.playSound('writing');
      if (userContext.swipingLeftRightBlockedReason) {
        jokerContext.showInfo(
          'swiping left/right is blocked.\n' + userContext.swipingLeftRightBlockedReason
        );
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
      handleError(jokerContext, ErrorType.SWIPE, `${e}`);
    }
  };

  const handleSwipeLeft = async () => {
    try {
      soundContext.playSound('fire');
      if (userContext.swipingLeftRightBlockedReason) {
        jokerContext.showInfo(
          'swiping left/right is blocked.\n' + userContext.swipingLeftRightBlockedReason
        );
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
      handleError(jokerContext, ErrorType.SWIPE, `${e}`);
    }
  };

  const handleSwipeDown = async () => {
    try {
      soundContext.playSound('whooshLo');
      if (!activeCard) {
        throw new Error('could not find swiped card');
      }
      await popAndLoadCard();
    } catch (e) {
      handleError(jokerContext, ErrorType.SWIPE, `${e}`);
    }
  };

  if (!activeCard && !loading) {
    return (
      <Reload
        onPress={() => {
          loadCards();
        }}
      />
    );
  }

  const pressMore = () => {
    soundContext.playSound('click');
    itemsContext.setOthersItem(activeCard);
    router.push({ pathname: 'swipe/item', params: { whosItem: 'other' } });
  };

  return (
    <GestureHandlerRootView>
      <Background tile="sword" opacity={0.3} />
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          {/* todo this was showing all the time in prod so for now just removed it but it should be handled properly */}
          {/* {cards.length === 0 && !loading && (
            <View style={styles.noCardsWrapper}>
              <TextWrapper style={styles.noCardsLabel}>No more cards</TextWrapper>
            </View>
          )} */}
          {activeCard && (
            <SwipeableCard
              itemData={activeCard}
              swipeCallbacks={{
                onSwipeRight: handleSwipeRight,
                onSwipeLeft: handleSwipeLeft,
                onSwipeDown: handleSwipeDown,
              }}
              lockGesture={lockGesture}
              onPressMore={pressMore}
            />
          )}
        </View>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        )}
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
  loader: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, .7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
