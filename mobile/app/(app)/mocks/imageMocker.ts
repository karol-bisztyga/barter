const checkImage = async (url: string) => {
  const response = await fetch(url);
  return response.status === 200;
};

const generateUrl = (width?: number, height?: number) => {
  width = width || Math.floor(Math.random() * 50 + 200);
  height = height || Math.floor(Math.random() * 50 + 200);
  const id = Math.floor(Math.random() * 1000);

  return `https://picsum.photos/id/${id}/${width}/${height}`;
};

const generateImage = async (width?: number, height?: number): Promise<string> => {
  let imageCorrect = false;
  let url = null;
  while (!imageCorrect || !url) {
    url = generateUrl(width, height);
    imageCorrect = await checkImage(url);
  }

  return url;
};

module.exports = { generateImage };
