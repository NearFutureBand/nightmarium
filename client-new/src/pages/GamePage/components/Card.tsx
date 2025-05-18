import clsx from 'clsx';
import { MONSTER_PART } from 'src/img';
import { useDragndrop } from 'src/modules/dragndrop';
import { useIsCardSelected } from 'src/modules/selection/hooks';
import { useSelection } from 'src/modules/selection/useSelection';
import { CardType } from 'src/types';

export const Card = ({
  id,
  card,
  disabled = false,
  hoverEffect = false,
  monsterId,
  playerId
}: {
  id: number;
  card?: CardType;
  disabled?: boolean;
  hoverEffect?: boolean;
  monsterId?: number;
  playerId?: string;
}) => {
  const selectCard = useSelection((s) => s.selectCard);
  const checkIsCardSelected = useIsCardSelected();
  const setDraggedCard = useDragndrop((s) => s.setDraggedCard);
  const resetDraggedCard = useDragndrop((s) => s.resetDraggedCard);
  return (
    <img
      alt={`Moster card number ${id}`}
      src={MONSTER_PART[id]}
      className={clsx(
        'aspect-[204/131] transition-transform rounded-2xl',
        checkIsCardSelected(id) && 'border-accent-500 border-2',
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
      onClick={() => {
        console.log('select card', card);
        if (card) selectCard({ card, monsterId, playerId });
      }}
    />
  );
};
