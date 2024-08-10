import { executeQuery } from './executeQuery';

export const getUserMatches = async (token: string) => {
  const response = await executeQuery('matches', 'GET', null, null, token);
  if (response.ok) {
    return response.data;
  } else {
    throw new Error('get user items error: ' + response.data.message);
  }
};
