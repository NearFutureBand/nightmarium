import { MONSTER_PART } from 'src/img';
import { useDragndrop } from 'src/modules/dragndrop';
import { CardType } from 'src/types';

export const Card = ({ id, card }: { id: number; card?: CardType }) => {
  const setDraggedCard = useDragndrop((s) => s.setDraggedCard);
  const resetDraggedCard = useDragndrop((s) => s.resetDraggedCard);
  return (
    <img
      alt={`Moster card number ${id}`}
      src={MONSTER_PART[id]}
      className="aspect-[204/131]"
      draggable
      onDragStart={() => {
        if (card) setDraggedCard(card);
      }}
      onDragEnd={resetDraggedCard}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
    />
  );
};
