import { CardType, MonsterType } from 'src/types';
import { create } from 'zustand';

type SelectedCard = { card: CardType; playerId?: string; monsterId?: number };
type SelectedMonster = { monster: MonsterType; playerId: string };

export const useSelection = create<{
  selectedCards: SelectedCard[];
  selectedMonster: SelectedMonster | null;
  selectCard: (cardData: SelectedCard) => void;
  resetSelectedCards: () => void;
  selectMonster: (monsterData: SelectedMonster) => void;
  resetSelectedMonster: () => void;
}>((set) => {
  return {
    selectedCards: [],
    selectedCard: null,
    selectedMonster: null,
    selectCard: (cardData: SelectedCard) => {
      set(({ selectedCards }) => {
        const isAlreadySelected = selectedCards.find((card) => card.card.id === cardData.card.id);
        if (isAlreadySelected) {
          return {
            selectedCards: selectedCards.filter((card) => card.card.id !== cardData.card.id)
          };
        }
        return { selectedCards: [...selectedCards, cardData] };
      });
    },
    resetSelectedCards: () => set({ selectedCards: [] }),
    selectMonster: (monsterData: SelectedMonster) => {
      set(({ selectedMonster }) => {
        if (selectedMonster?.monster.id === monsterData.monster.id) {
          return { selectedMonster: null };
        }
        return { selectedMonster: monsterData };
      });
    },
    resetSelectedMonster: () => set({ selectedMonster: null })
  };
});
