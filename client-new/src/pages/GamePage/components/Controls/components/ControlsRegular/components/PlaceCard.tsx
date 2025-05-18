import { memo } from 'react';
import { useSelection } from 'src/modules/selection/useSelection';

export const PlaceCard = memo(function PlaceCard() {
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const selectedCards = useSelection((s) => s.selectedCards);

  const canPlaceCard = Boolean(selectedMonster) && selectedCards.length === 1;

  const handlePlaceCard = () => {};

  return (
    <button
      onClick={handlePlaceCard}
      disabled={!canPlaceCard}
      title="Выберите карту и монстра в которого хотите ее положить">
      Выложить карту
    </button>
  );
});
