export type RestMethod = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const executeQuery = async (
  rawUrl: string,
  method: RestMethod,
  params?: Record<string, string>,
  token?: string
) => {
  const config = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: '',
  };

  const url = `${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}/${rawUrl}`;

  if (params) {
    if (method === 'GET') {
      const modifiedUrl = new URL(url);
      Object.keys(params).forEach((key) => modifiedUrl.searchParams.append(key, params[key]));

      console.log('sending request to modified url', modifiedUrl.toString());
    } else {
      config['body'] = JSON.stringify(params);
    }
  }

  const response = await fetch(url, config);
  const data = await response.json();
  console.log('response', data);

  return {
    ...response,
    data,
  };
};
