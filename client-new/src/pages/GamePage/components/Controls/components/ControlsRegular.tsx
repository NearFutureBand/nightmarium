import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import { LastStep } from './LastStep';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';

export const ControlsRegular = () => {
  const { actions } = useGameData();
  const sendMessage = useSendMessage();
  const gameId = useGameId();

  const handleTakeCard = () => {
    sendMessage({
      type: 'TAKE_CARD',
      gameId
    });
  };
  const handlePlaceCard = () => {};
  const handleChangeCards = () => {};

  return (
    <>
      <section className="flex flex-col md:flex-row gap-2">
        <button onClick={handleTakeCard}>Взять карту</button>
        <button onClick={handlePlaceCard}>Выложить карту</button>
        <button onClick={handleChangeCards}>Обменять карты</button>
      </section>

      <section>
        <div>
          Действий осталось: <strong>{actions}</strong>
        </div>
        <LastStep />
      </section>
    </>
  );
};
