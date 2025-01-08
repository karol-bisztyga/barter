import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ButtonWrapper from '../../../../genericComponents/ButtonWrapper';
import { useUserContext } from '../../../../context/UserContext';
import { useItemsContext } from '../../../../context/ItemsContext';
import { useJokerContext } from '../../../../context/JokerContext';
import { useSocketContext } from '../../../../context/SocketContext';
import { ItemData } from '../../../../types';
import TextWrapper from '../../../../genericComponents/TextWrapper';
import Background from '../../../../components/Background';
import { ErrorType, handleError } from '../../../../utils/errorHandler';
import { useFont } from '../../../../hooks/useFont';
import { Separator } from './Separator';

export const Info = () => {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const jokerContext = useJokerContext();
  const socketContext = useSocketContext();

  const myDefaultItemId = useRef(itemsContext.usersItemId);

  const { othersItem, usersItemId, usersItemsLikedByTargetItemOwner, newMatchId } = itemsContext;

  const usersItem: ItemData | undefined = userContext.findItemById(usersItemId)?.item;

  const fontFamily = useFont();

  const handleProceed = async () => {
    if (!newMatchId || !itemsContext.usersItemId) {
      handleError(
        t,
        jokerContext,
        ErrorType.UPDATE_MATCH,
        `Update match action did not receive all required data: [${!!newMatchId}][${!!itemsContext.usersItemId}]`
      );
      return;
    }
    // modify newly created match if the item was switched
    if (myDefaultItemId.current && myDefaultItemId.current !== itemsContext.usersItemId) {
      try {
        socketContext.sendUpdateMatch({
          matchId: newMatchId,
          newMatchingItemId: itemsContext.usersItemId,
        });
        itemsContext.setNewMatchId(null);
      } catch (e) {
        handleError(t, jokerContext, ErrorType.UPDATE_MATCH, `${e}`);
        return;
      }
    }
    router.back();
  };

  if (!usersItem || !othersItem || !usersItemId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Background tile="paper" />

      <TextWrapper
        style={[
          styles.infoLabel,
          {
            fontFamily: fontFamily.italic,
          },
        ]}
      >
        {t('match_i_give_you')}
      </TextWrapper>

      <TextWrapper style={[styles.infoLabel, styles.infoLabelItemName]}>
        {usersItem.name}
      </TextWrapper>

      <Separator marginTop={8} />

      <TextWrapper
        style={[
          styles.infoLabel,
          {
            fontFamily: fontFamily.italic,
          },
        ]}
      >
        {t('match_you_give_me')}
      </TextWrapper>

      <TextWrapper style={[styles.infoLabel, styles.infoLabelItemName]}>
        {othersItem.name}
      </TextWrapper>

      <View style={styles.buttonsWrapper}>
        {usersItemsLikedByTargetItemOwner.length > 1 && (
          <View style={styles.singleButtonWrapper}>
            <ButtonWrapper
              title={t('match_switch_my_item')}
              onPress={() => {
                router.push('swipe/switch_item');
              }}
              mode="red"
            />
          </View>
        )}
        <View style={styles.singleButtonWrapper}>
          <ButtonWrapper title={t('proceed')} onPress={handleProceed} mode="black" marginTop={8} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  infoLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'white',
  },
  infoLabelItemName: {
    fontSize: 24,
    marginTop: 2,
  },

  buttonsWrapper: {
    margin: 20,
    height: 100,
  },
  singleButtonWrapper: {
    flex: 1,
  },
});
