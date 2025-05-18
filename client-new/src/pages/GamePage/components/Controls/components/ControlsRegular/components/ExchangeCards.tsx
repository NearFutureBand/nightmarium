import { memo } from 'react';
import { useSelection } from 'src/modules/selection/useSelection';

export const ExchangeCards = memo(function () {
  const selectedCards = useSelection((s) => s.selectedCards);
  const canExchange = selectedCards.length >= 2;
  const handleExchangeCards = () => {};
  return (
    <button
      onClick={handleExchangeCards}
      title="Выберите хотя бы две карты чтобы обменять их на новые"
      disabled={!canExchange}>
      Обменять карты
    </button>
  );
});
