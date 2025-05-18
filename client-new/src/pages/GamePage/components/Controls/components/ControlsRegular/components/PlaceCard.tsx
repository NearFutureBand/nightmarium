import { memo } from 'react';
import { useSelection } from 'src/modules/selection/useSelection';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';

export const PlaceCard = memo(function PlaceCard() {
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const selectedCards = useSelection((s) => s.selectedCards);
  const resetSelectedCards = useSelection((s) => s.resetSelectedCards);
  const resetSelectedMonster = useSelection((s) => s.resetSelectedMonster);
  const sendMessage = useSendMessage();
  const gameId = useGameId();

  const canPlaceCard = Boolean(selectedMonster) && selectedCards.length === 1;

  const handlePlaceCard = () => {
    if (!canPlaceCard) return;
    sendMessage<{ cardId: number; monsterId: number; gameId: string }>({
      type: 'PLAY_CARD',
      cardId: selectedCards[0].card.id,
      monsterId: selectedMonster!.monster.id,
      gameId: gameId!
    });
    resetSelectedCards();
    resetSelectedMonster();
  };

  return (
    <button
      onClick={handlePlaceCard}
      disabled={!canPlaceCard}
      title="Выберите карту и монстра в которого хотите ее положить">
      Выложить карту
    </button>
  );
});
