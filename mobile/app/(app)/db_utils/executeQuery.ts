import Constants from 'expo-constants';

export type RestMethod = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const executeQuery = async (
  rawUrl: string,
  method: RestMethod,
  urlParams?: Record<string, string> | null,
  body?: Record<string, string> | null,
  token?: string
) => {
  const config = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    },
    body: '',
  };

  let url = `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:${process.env.EXPO_PUBLIC_SERVER_PORT}/${rawUrl}`;

  if (urlParams) {
    const modifiedUrl = new URL(url);
    Object.keys(urlParams).forEach((key) => modifiedUrl.searchParams.append(key, urlParams[key]));
    url = modifiedUrl.toString();
    console.log('sending request to modified url', url);
  }
  if (body) {
    config['body'] = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  return {
    ...response,
    data,
  };
};
