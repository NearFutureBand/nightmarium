import { CardType, MonsterType } from 'src/types';
import { create } from 'zustand';

type SelectedCard = { card: CardType; playerId: string };
type SelectedMonster = { monster: MonsterType; playerId: string };

export const useSelection = create<{
  selectedCard: SelectedCard | null;
  selectedMonster: SelectedMonster | null;
  setSelectedCard: (cardData: SelectedCard) => void;
  resetSelectedCard: () => void;
  setSelectedMonster: (monsterData: SelectedMonster) => void;
  resetSelectedMonster: () => void;
}>((set) => {
  return {
    selectedCard: null,
    selectedMonster: null,
    setSelectedCard: (cardData: SelectedCard) => {
      set({ selectedCard: cardData });
    },
    resetSelectedCard: () => set({ selectedCard: null }),
    setSelectedMonster: (monsterData: SelectedMonster) => {
      set({ selectedMonster: monsterData });
    },
    resetSelectedMonster: () => set({ selectedMonster: null })
  };
});
