const contexts = {
  backgrounds: require.context('./1backgrounds', false, /\.(png|jpe?g|svg)$/),
  other: require.context('./2other1', false, /\.(png|jpe?g|svg)$/),
  characters: require.context('./3characters', false, /\.(png|jpe?g|svg)$/),
  clothes: require.context('./4clothes', false, /\.(png|jpe?g|svg)$/),
  hats: require.context('./5hats', false, /\.(png|jpe?g|svg)$/),
  items: require.context('./7items', false, /\.(png|jpe?g|svg)$/),
};

export function getPfpImage(category, key) {
  if (!contexts[category] || !key) return null;
  try {
    return contexts[category](key);
  } catch (e) {
    console.error(`Could not load image for category: ${category}, key: ${key}`, e);
    return null;
  }
}

export const pfpLayerKeys = Object.keys(contexts).reduce((acc, category) => {
  try {
    acc[category] = contexts[category].keys();
  } catch (e) {
    console.error(`Could not get keys for category: ${category}`, e);
    acc[category] = [];
  }
  return acc;
}, {});