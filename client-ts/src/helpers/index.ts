import { ABILITY_TYPE, BODYPARTS } from '../constants';
import {
  AbilityState,
  Legion,
  SelectedCard,
  SelectedCardShort,
  SelectedMonster,
} from '../types';

export const getCardIndexInSelection = (
  cardData: SelectedCardShort,
  selectedCards: SelectedCardShort[]
): number => {
  return selectedCards.findIndex((card) => {
    return (
      card.cardId === cardData.cardId &&
      card.monsterId === cardData.monsterId &&
      card.playerId === cardData.playerId
    );
  });
};

export const isCardInSelection = (
  cardData: SelectedCardShort,
  selectedCards: SelectedCardShort[]
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

export const validateCardToMonster = ({
  selectedCard,
  selectedMonster,
  lastAction,
  abilityState,
}: {
  selectedCard: SelectedCard;
  selectedMonster: SelectedMonster;
  lastAction: string | null;
  abilityState: AbilityState | null;
}): string | undefined => {
  const wolfOrSmileAbility =
    abilityState?.abilityType === ABILITY_TYPE.SMILE ||
    abilityState?.abilityType === ABILITY_TYPE.WOLF;

  if (lastAction?.match(/PLAY_CARD/) && !wolfOrSmileAbility) {
    const lastPlayedLegion = lastAction.split(':')[1] as Legion;
    if (lastPlayedLegion !== selectedCard.legion) {
      return `Можно поставить только карту легиона ${lastPlayedLegion}`;
    }
  }

  if (
    !selectedCard.cardBodypart.some(
      (bodypartIndex) => bodypartIndex === selectedMonster.monsterBodyLength
    )
  ) {
    return `Карта ${selectedCard.cardBodypart
      .map((bp) => BODYPARTS[bp])
      .join('/')} не может быть установлена в слот для ${
      BODYPARTS[selectedMonster.monsterBodyLength]
    }`;
  }

  return undefined;
};
