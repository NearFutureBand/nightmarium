import { CardType, MonsterType } from 'src/types';
import { create } from 'zustand';

export const useDragndrop = create<{
  selectedCard: CardType | null;
  selectedMonster: MonsterType | null;
  setSelectedCard: (card: CardType) => void;
  resetSelectedCard: () => void;
  setSelectedMonster: (monster: MonsterType) => void;
  resetSelectedMonster: () => void;
}>((set) => {
  return {
    selectedCard: null,
    selectedMonster: null,
    setSelectedCard: (card: CardType) => {
      set({ selectedCard: card });
    },
    resetSelectedCard: () => set({ selectedCard: null }),
    setSelectedMonster: (monster: MonsterType) => {
      set({ selectedMonster: monster });
    },
    resetSelectedMonster: () => set({ selectedMonster: null })
  };
});
