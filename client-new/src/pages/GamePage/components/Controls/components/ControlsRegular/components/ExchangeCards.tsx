import { memo } from 'react';
import { useSelection } from 'src/modules/selection/useSelection';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';

export const ExchangeCards = memo(function () {
  const selectedCards = useSelection((s) => s.selectedCards);
  const resetSelectedCards = useSelection((s) => s.resetSelectedCards);
  const sendMessage = useSendMessage();
  const gameId = useGameId();
  const canExchange = selectedCards.length >= 2;
  const handleExchangeCards = () => {
    sendMessage<{ cardIds: number[]; gameId: string }>({
      /** @todo change type to EXCHANGE_CARDS */
      type: 'CHANGE_CARDS',
      cardIds: selectedCards.map((card) => card.card.id),
      gameId: gameId!
    });
    resetSelectedCards();
  };
  return (
    <button
      onClick={handleExchangeCards}
      title="Выберите хотя бы две карты чтобы обменять их на новые"
      disabled={!canExchange}>
      Обменять карты
    </button>
  );
});
