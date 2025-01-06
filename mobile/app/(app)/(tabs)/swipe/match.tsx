import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ItemData } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';
import TextWrapper from '../../genericComponents/TextWrapper';
import { useJokerContext } from '../../context/JokerContext';
import Background from '../../components/Background';
import { FILL_COLOR } from '../profile/components/items/editing_panels/constants';
import { SWIPE_BASE_BACKGROUND_COLOR } from '../../constants';
import { hexToRgbaString } from '../../utils/harmonicColors';
import { useTranslation } from 'react-i18next';
import { useSocketContext } from '../../context/SocketContext';

const { width } = Dimensions.get('window');

const Match = () => {
  const { t } = useTranslation();

  const userContext = useUserContext();
  const itemsContext = useItemsContext();
  const jokerContext = useJokerContext();
  const socketContext = useSocketContext();

  const myDefaultItemId = useRef(itemsContext.usersItemId);

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
      <TextWrapper style={styles.matchedLabel}>{t('match_items_matched')}</TextWrapper>
      <View style={styles.imagesWrapper}>
        {/* Left Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: usersItem.images[0] }} style={[styles.image, styles.leftImage]} />
        </View>

        {/* Right Image */}
        <View style={[styles.imageContainer, styles.rightImageContainer]}>
          <Image source={{ uri: othersItem.images[0] }} style={[styles.image, styles.rightImage]} />
        </View>
      </View>

      <View style={styles.infoWrapper}>
        <Background tile="stone" opacity={0.8} />
        <TextWrapper style={styles.infoLabel}>{t('match_i_give_you')}</TextWrapper>
        <TextWrapper style={[styles.infoLabel, styles.infoLabelItemName]}>
          {usersItem.name}
        </TextWrapper>
        <TextWrapper style={styles.infoLabel}>{t('match_you_give_me')}</TextWrapper>
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
                color={'red'}
                fillColor={FILL_COLOR}
              />
            </View>
          )}
          <View style={styles.singleButtonWrapper}>
            <ButtonWrapper
              title={t('proceed')}
              fillColor={FILL_COLOR}
              onPress={async () => {
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
                if (
                  myDefaultItemId.current &&
                  myDefaultItemId.current !== itemsContext.usersItemId
                ) {
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
              }}
              color={'lightgreen'}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  matchedLabel: {
    fontSize: 50,
    textAlign: 'center',
  },
  imagesWrapper: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width / 2, // Adjust width as needed
    height: width / 2, // Adjust height as needed
    resizeMode: 'contain',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: hexToRgbaString(SWIPE_BASE_BACKGROUND_COLOR, 0.3),
  },
  leftImage: {
    transform: [{ rotate: '-5deg' }], // Adjust rotation as needed
  },
  rightImageContainer: {
    marginLeft: -10, // Overlap adjustment, change as needed
  },
  rightImage: {
    transform: [{ rotate: '15deg' }, { translateY: 60 }], // Adjust rotation as needed
  },

  infoWrapper: {
    marginTop: 100,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  infoLabel: {
    fontSize: 16,
    textAlign: 'center',
    padding: 4,
  },
  infoLabelItemName: {
    fontSize: 24,
  },

  buttonsWrapper: {
    flexDirection: 'column',
    marginVertical: 20,
    height: 100,
  },
  singleButtonWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default Match;
