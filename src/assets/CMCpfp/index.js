function importAll(r) {
  return r.keys().map(r);
}

const backgrounds = importAll(require.context('./1backgrounds', false, /\.(png|jpe?g|svg)$/));
const other1 = importAll(require.context('./2other1', false, /\.(png|jpe?g|svg)$/));
const characters = importAll(require.context('./3characters', false, /\.(png|jpe?g|svg)$/));
const clothes = importAll(require.context('./4clothes', false, /\.(png|jpe?g|svg)$/));
const hats = importAll(require.context('./5hats', false, /\.(png|jpe?g|svg)$/));
const other2 = importAll(require.context('./6other2', false, /\.(png|jpe?g|svg)$/));
const items = importAll(require.context('./7items', false, /\.(png|jpe?g|svg)$/));

export const pfpLayers = {
  backgrounds,
  other1,
  characters,
  clothes,
  hats,
  other2,
  items,
};