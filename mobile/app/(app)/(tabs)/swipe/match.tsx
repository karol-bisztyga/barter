import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ItemData } from '../../types';
import { useUserContext } from '../../context/UserContext';
import { ErrorType, handleError } from '../../utils/errorHandler';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import Background from '../../components/Background';
import { useTranslation } from 'react-i18next';
import { useItemsContext } from '../../context/ItemsContext';
import { Separator } from './components/match/Separator';
import { Images } from './components/match/Images';
import { Info } from './components/match/Info';
import { capitalizeFirstLetterOfEveryWord } from '../../utils/reusableStuff';

const Match = () => {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const jokerContext = useJokerContext();

  const { othersItem, usersItemId, usersItemsLikedByTargetItemOwner, newMatchId } = itemsContext;

  const usersItem: ItemData | undefined = userContext.findItemById(usersItemId)?.item;

  useEffect(() => {
    if (!usersItemId || !usersItemsLikedByTargetItemOwner.length || !othersItem || !newMatchId) {
      handleError(
        t,
        jokerContext,
        ErrorType.CORRUPTED_SESSION,
        `Match screen did not receive all required data: [${!!itemsContext.usersItemId}][${!!itemsContext.usersItemsLikedByTargetItemOwner.length}][${!!itemsContext.othersItem}][${!!newMatchId}]`
      );
      router.back();
    }
    if (!othersItem || !usersItem) {
      handleError(
        t,
        jokerContext,
        ErrorType.CORRUPTED_SESSION,
        `at least on of the items has not been set`
      );
      router.back();
    }
  }, []);

  if (!usersItem || !othersItem || !usersItemId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Background tile="main" forceFullScreen />
      <TextWrapper style={styles.matchedLabel}>
        {capitalizeFirstLetterOfEveryWord(t('match_items_matched'))}
      </TextWrapper>
      <Separator marginTop={4} />
      <Images leftImageUri={usersItem.images[0]} rightImageUri={othersItem.images[0]} />
      <Info />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  matchedLabel: {
    marginTop: 50,
    fontSize: 28,
    textAlign: 'center',
  },
});

export default Match;
