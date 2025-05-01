import { CardType } from 'src/types';
import { create } from 'zustand';

export const useDragndrop = create<{
  draggedCard: CardType | null;
  setDraggedCard: (card: CardType) => void;
  resetDraggedCard: () => void;
}>((set) => {
  return {
    draggedCard: null,
    setDraggedCard: (card: CardType) => {
      set({ draggedCard: card });
    },
    resetDraggedCard: () => set({ draggedCard: null })
  };
});
