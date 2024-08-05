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
      Authorization: `Bearer ${token}`,
    },
    body: '',
  };

  const url = `${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}/${rawUrl}`;

  if (urlParams) {
    const modifiedUrl = new URL(url);
    Object.keys(urlParams).forEach((key) => modifiedUrl.searchParams.append(key, urlParams[key]));

    console.log('sending request to modified url', modifiedUrl.toString());
  }
  if (body) {
    config['body'] = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const data = await response.json();
  console.log('response', data);

  return {
    ...response,
    data,
  };
};
