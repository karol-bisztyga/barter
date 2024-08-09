import { executeQuery } from './executeQuery';

export const updateMatchMatchingItem = async (
  token: string,
  newMatchingItemId: string,
  matchingItemId: string,
  matchedItemId: string
) => {
  const response = await executeQuery(
    `matches`,
    'PUT',
    null,
    { newMatchingItemId, matchingItemId, matchedItemId },
    token
  );
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('send like error: ' + response.data.message);
  }
};
