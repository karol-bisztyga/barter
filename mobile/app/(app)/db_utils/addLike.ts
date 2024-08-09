import { executeQuery } from './executeQuery';

export const addLike = async (likedItemId: string, decision: boolean, token: string) => {
  const response = await executeQuery(
    `likes`,
    'POST',
    null,
    { likedItemId, decision: decision.toString() },
    token
  );
  if (response.ok) {
    // here we should return whether a match was made or not
    // of there's a match, the user will see the screen to choose an item for this match
    return response.data;
  } else {
    throw new Error('send like error: ' + response.data.message);
  }
};
