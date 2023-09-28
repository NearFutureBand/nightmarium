function importAllImages() {
  const context = require.context('./monsters', false, /\.png$/);
  const images: { [key: number]: any } = {};
  context.keys().forEach((item, index) => {
    images[parseInt(item.replace('./', '').replace('.png', ''))] =
      context(item);
  });
  return images;
}

export const MONSTER_PART = importAllImages();
