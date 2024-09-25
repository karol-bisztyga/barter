import React, { useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Item from '../../components/Item';
import { router } from 'expo-router';
import { ItemData, ItemBorderRadius } from '../../types';
import { useItemsContext } from '../../context/ItemsContext';
import { useUserContext } from '../../context/UserContext';
import { updateMatchMatchingItem } from '../../db_utils/updateMatchMatchingItem';
import { authorizeUser } from '../../utils/reusableStuff';
import { ErrorType, handleError } from '../../utils/errorHandler';
import ButtonWrapper from '../../genericComponents/ButtonWrapper';

const { width } = Dimensions.get('window');

const Match = () => {
  const sessionContext = authorizeUser();
  const userContext = useUserContext();
  const itemsContext = useItemsContext();

  const { othersItem, usersItemId, usersItemsLikedByTargetItemOwner } = itemsContext;

  if (!usersItemId || !usersItemsLikedByTargetItemOwner.length || !othersItem) {
    handleError(
      ErrorType.CORRUPTED_SESSION,
      `Match screen did not receive all required data: [${!!itemsContext.usersItemId}][${!!itemsContext.usersItemsLikedByTargetItemOwner.length}][${!!itemsContext.othersItem}]`
    );
    return null;
  }
  const myDefaultItemId = useRef(itemsContext.usersItemId);

  const usersItem: ItemData | undefined = userContext.findItemById(usersItemId)?.item;
  if (!othersItem || !usersItem) {
    handleError(ErrorType.CORRUPTED_SESSION, `at least on of the items has not been set`);
    router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.matchedLabel}>Items matched!</Text>
      <View
        style={[
          styles.itemsWrapper,
          {
            height: width,
            width: width,
            paddingLeft: 10,
            paddingRight: 10,
          },
        ]}
      >
        <View style={[styles.itemsImagesWrapper, { height: width }]}>
          <View style={styles.usersItem}>
            <Item
              itemData={usersItem}
              borderRadius={ItemBorderRadius.all}
              carouselOptions={{
                dotsVisible: false,
                pressEnabled: false,
              }}
              showDescription={false}
              showName={false}
            />
          </View>
          <View style={styles.matchedItem}>
            <Item
              itemData={othersItem}
              borderRadius={ItemBorderRadius.all}
              carouselOptions={{
                dotsVisible: false,
                pressEnabled: false,
              }}
              showDescription={false}
              showName={false}
            />
          </View>
        </View>
        <View style={styles.itemsLabelsWrapper}>
          <View style={styles.usersItem}>
            <Text style={[styles.itemsLabel, { paddingRight: 10 }]}>{usersItem.name}</Text>
          </View>
          <View style={styles.matchedItem}>
            <Text style={[styles.itemsLabel, { paddingLeft: 10 }]}>{othersItem.name}</Text>
          </View>
        </View>
        <View style={styles.bottomSectionWrapper}>
          <View style={styles.buttonsWrapper}>
            {itemsContext.usersItemsLikedByTargetItemOwner.length > 1 && (
              <View style={styles.singleButtonWrapper}>
                <ButtonWrapper
                  title="Switch my item"
                  onPress={() => {
                    router.push('swipe/switch_item');
                  }}
                  color={'red'}
                />
              </View>
            )}
            <View style={styles.singleButtonWrapper}>
              <ButtonWrapper
                title="Proceed!"
                onPress={async () => {
                  // modify newly created match if the item was switched
                  if (
                    myDefaultItemId.current &&
                    myDefaultItemId.current !== itemsContext.usersItemId
                  ) {
                    try {
                      await updateMatchMatchingItem(
                        sessionContext,
                        usersItemId,
                        myDefaultItemId.current,
                        othersItem.id
                      );
                    } catch (e) {
                      handleError(ErrorType.UPDATE_MATCH, `${e}`);
                      return;
                    }
                  }
                  router.back();
                }}
                color={'green'}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  itemsWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  itemsImagesWrapper: {
    flex: 1,
    height: 200,
    flexDirection: 'row',
  },
  usersItem: {
    flex: 1,
  },
  matchedItem: {
    flex: 1,
  },
  itemsLabelsWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  itemsLabel: {
    fontSize: 30,
    textAlign: 'center',
  },
  matchedLabel: {
    fontSize: 50,
    textAlign: 'center',
  },
  bottomSectionWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: 50,
  },
  buttonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  singleButtonWrapper: {
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
});

export default Match;
