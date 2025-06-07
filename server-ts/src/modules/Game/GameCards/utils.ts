import { CARDS } from 'src/modules/Cards';

export const getShuffledCards = () => {
  const cards = Object.values(CARDS);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = cards[i];
    cards[i] = cards[j];
    cards[j] = temp;
  }
  return cards;
};
