import clsx from 'clsx';
import { MONSTER_PART } from 'src/img';
import { useDragndrop } from 'src/modules/dragndrop';
import { CardType } from 'src/types';

export const Card = ({
  id,
  card,
  disabled = false,
  hoverEffect = false
}: {
  id: number;
  card?: CardType;
  disabled?: boolean;
  hoverEffect?: boolean;
}) => {
  const setDraggedCard = useDragndrop((s) => s.setDraggedCard);
  const resetDraggedCard = useDragndrop((s) => s.resetDraggedCard);
  return (
    <img
      alt={`Moster card number ${id}`}
      src={MONSTER_PART[id]}
      className={clsx(
        'aspect-[204/131] transition-transform rounded-2xl',
        hoverEffect && 'hover:-translate-y-4',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      draggable={!disabled}
      onDragStart={() => {
        if (card) setDraggedCard(card);
      }}
      onDragEnd={resetDraggedCard}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
    />
  );
};
