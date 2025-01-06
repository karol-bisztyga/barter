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
import { getItemsForCards } from '../../db_utils/getItemsForCards';
import { addLike } from '../../db_utils/addLike';
import { ErrorType, handleError } from '../../utils/errorHandler';
import { executeProtectedQuery } from '../../db_utils/executeProtectedQuery';
import { useJokerContext } from '../../context/JokerContext';
import Background from '../../components/Background';
import { useSettingsContext } from '../../context/SettingsContext';
import Reload from './components/Reload';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSocketContext } from '../../context/SocketContext';

const LOADED_ITEMS_CAPACITY = 5;
// when there are less items loaded than this value, new items will be fetched
const ITEMS_LOAD_TRESHOLD = 3;

export default function Swipe() {
  const { t } = useTranslation();

  const sessionContext = useAuth();
  const settingsContext = useSettingsContext();
  const socketContext = useSocketContext();

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
        handleError(t, jokerContext, ErrorType.UPDATE_ONBOARDING, `${e}`);
      }
    })();
  }, []);

  // load user's items
  useEffect(() => {
    if (!userContext.data) {
      handleError(t, jokerContext, ErrorType.CORRUPTED_SESSION);
      return;
    }
    getUserItems(sessionContext)
      .then((items) => {
        userContext.setItems(items);
      })
      .catch((e) => {
        handleError(t, jokerContext, ErrorType.LOAD_ITEMS, `${e}`);
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
        handleError(t, jokerContext, ErrorType.LOAD_CARDS, `${e}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (!emptyCardsResponseReceived || activeCard) {
      return;
    }

    jokerContext.showNonBlockingInfo(t('no_items_available'));
    setEmptyCardsResponseReceived(false);
    setLoading(false);
  }, [emptyCardsResponseReceived, activeCard]);

  const popAndLoadCard = async (): Promise<void> => {
    if (!activeCard) {
      return;
    }

    let updatedCards = [...cards];
    if (cards.length <= ITEMS_LOAD_TRESHOLD) {
      await (async () => {
        try {
          if (emptyCardsResponseReceived) {
            return;
          }
          const currentCardsWithActiveCardIds = [...cards, activeCard].map((card) => card.id);
          const itemsLoaded = await getItemsForCards(
            sessionContext,
            currentCardsWithActiveCardIds,
            LOADED_ITEMS_CAPACITY
          );
          if (itemsLoaded.length) {
            setEmptyCardsResponseReceived(false);
            updatedCards = [...itemsLoaded, ...updatedCards];
          } else {
            setEmptyCardsResponseReceived(true);
          }
        } catch (e) {
          handleError(t, jokerContext, ErrorType.LOAD_CARDS, `${e}`);
          return;
        }
      })();
    }
    const newActiveCard: ItemData | null = updatedCards.pop() || null;
    if (!newActiveCard) {
      setActiveCard(null);
    } else {
      setActiveCard(newActiveCard);
      setCards(updatedCards);
    }
  };

  const loadCards = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const itemsLoaded = await getItemsForCards(
      sessionContext,
      cards.map((card) => card.id),
      LOADED_ITEMS_CAPACITY
    );
    if (!itemsLoaded.length) {
      setEmptyCardsResponseReceived(true);
    } else {
      const newActiveCard = itemsLoaded.pop();
      if (!newActiveCard) {
        setActiveCard(null);
        return;
      }
      setActiveCard(newActiveCard);
      setCards(itemsLoaded);
    }
    setLoading(false);
  };

  const sendLike = async (likedItemId: string, decision: boolean) => {
    try {
      return await addLike(sessionContext, likedItemId, decision);
    } catch (e) {
      handleError(t, jokerContext, ErrorType.SEND_LIKE, `${e}`);
    }
  };

  const handleSwipeRight = async () => {
    try {
      if (userContext.swipingLeftRightBlockedReason) {
        jokerContext.showInfo(
          t('swiping_left_right_blocked') + userContext.swipingLeftRightBlockedReason
        );
        return;
      }
      const swipedCard = activeCard;
      if (swipedCard === null) {
        throw new Error('could not find swiped card');
      }
      await popAndLoadCard();
      const sendLikeResult = await sendLike(swipedCard.id, true);
      lockGesture.value = false;

      if (sendLikeResult.matchStatus === 'match') {
        itemsContext.setUsersItemId(sendLikeResult.matchResult.matchingItemId);
        itemsContext.setOthersItem(swipedCard);
        itemsContext.setUsersItemsLikedByTargetItemOwner(
          sendLikeResult.myItemsLikedByTargetItemOwner
        );
        const { matchId, matchingItemId, matchedItemId } = sendLikeResult.matchResult;
        socketContext.sendAddMatch({
          matchId,
          matchingItemId,
          matchedItemId,
        });
        itemsContext.setNewMatchId(matchId);
        router.push('swipe/match');
      }
    } catch (e) {
      handleError(t, jokerContext, ErrorType.SWIPE, `${e}`);
    }
  };

  const handleSwipeLeft = async () => {
    try {
      if (userContext.swipingLeftRightBlockedReason) {
        jokerContext.showInfo(
          t('swiping_left_right_blocked') + userContext.swipingLeftRightBlockedReason
        );
        return;
      }
      const swipedCard = activeCard;
      if (swipedCard === null) {
        throw new Error('could not find swiped card');
      }
      await popAndLoadCard();
      const sendLikeResult = await sendLike(swipedCard.id, false);
      lockGesture.value = false;
      if (sendLikeResult.matchStatus === 'match') {
        throw new Error(
          `something went terribly wrong, it's a match even though the user disliked this item! This should never happen!`
        );
      }
    } catch (e) {
      handleError(t, jokerContext, ErrorType.SWIPE, `${e}`);
    }
  };

  const handleSwipeDown = async () => {
    try {
      if (!activeCard) {
        throw new Error('could not find swiped card');
      }
      await popAndLoadCard();
    } catch (e) {
      handleError(t, jokerContext, ErrorType.SWIPE, `${e}`);
    }
  };

  const pressMore = () => {
    settingsContext.playSound('click');
    itemsContext.setOthersItem(activeCard);
    router.push({ pathname: 'swipe/item', params: { whosItem: 'other' } });
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

  return (
    <GestureHandlerRootView>
      <Background tile="main" />
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
