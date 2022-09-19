import { SelectedCard } from '../types';

export const getCardIndexInSelection = (
  cardData: SelectedCard,
  selectedCards: SelectedCard[]
): number => {
  return selectedCards.findIndex((card) => {
    return (
      card.cardId === cardData.cardId &&
      card.monsterId === cardData.monsterId &&
      card.playerId === cardData.monsterId
    );
  });
};

export const isCardInSelection = (
  cardData: SelectedCard,
  selectedCards: SelectedCard[]
) => {
  return getCardIndexInSelection(cardData, selectedCards) >= 0;
};

export const defineCardSelectionMode = (
  isShiftKeyPressed: boolean,
  isCardAlreadySelected: boolean
) => {
  if (isShiftKeyPressed && isCardAlreadySelected) return 'remove';
  if (isShiftKeyPressed && !isCardAlreadySelected) return 'add';
  return undefined;
};
