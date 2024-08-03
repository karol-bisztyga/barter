const generateImage = (width, height) => {
  // Using `https://picsum.photos` to generate random image URLs
  width = width || Math.floor(Math.random() * 50 + 200); // Slightly vary the size to ensure distinct images
  height = height || Math.floor(Math.random() * 50 + 200);
  return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
};

module.exports = { generateImage };
