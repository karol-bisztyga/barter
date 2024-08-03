export type RestMethod = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const executeQuery = async (
  url: string,
  method: RestMethod,
  body: Record<string, string>,
  headers?: Record<string, string>
) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SERVER_HOST}:${process.env.EXPO_PUBLIC_SERVER_PORT}/${url}`,
    {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await response.json();

  return {
    ...response,
    data,
  };
};
