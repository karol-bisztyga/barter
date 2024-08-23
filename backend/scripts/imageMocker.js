const checkImage = async (url) => {
  const response = await fetch(url);
  return response.status === 200;
};

const generateUrl = (width, height) => {
  width = width || Math.floor(Math.random() * 50 + 200);
  height = height || Math.floor(Math.random() * 50 + 200);
  const id = Math.floor(Math.random() * 1000);

  return `https://picsum.photos/id/${id}/${width}/${height}`;
};

const generateImage = async (width, height) => {
  let imageCorrect = false;
  let url = null;
  while (!imageCorrect || !url) {
    url = generateUrl(width, height);
    imageCorrect = await checkImage(url);
  }
  console.log('> generate image', url);
  return url;
};

const generateImageAndFetch = async (width, height) => {
  let imageCorrect = false;
  let url = null;
  let response;
  const maxRetries = 5;
  let retryCount = 0;
  while (!imageCorrect || !url) {
    url = generateUrl(width, height);
    response = await fetch(url);
    imageCorrect = response.status === 200;
    if (retryCount++ > maxRetries) {
      throw new Error('image generator: retries limit reached');
    }
  }
  return { url, response };
};

module.exports = { generateImage, generateImageAndFetch };
