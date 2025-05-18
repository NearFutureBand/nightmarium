import { useSelection } from './useSelection';

export const useIsCardSelected = () => {
  const selectedCards = useSelection((s) => s.selectedCards);
  return (cardId: number) => selectedCards.findIndex((c) => c.card.id === cardId) >= 0;
};
