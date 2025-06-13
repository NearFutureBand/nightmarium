import { useIsTurn } from 'src/hooks/useIsTurn';
import { useSelection } from 'src/modules/selection/useSelection';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';

export const ControlsLegion = () => {
  const { legionMode, me } = useGameData();
  const { isMyTurn } = useIsTurn();
  const { selectedCards } = useSelection();
  const sendMessage = useSendMessage();
  const gameId = useGameId() as string;

  const playerId = me.id;
  if (!legionMode) return null;

  const canThrowCards =
    selectedCards.length === 2 || Boolean(selectedCards.find((card) => card.card.legion === 'red'));

  const handleThrowCards = () => {
    sendMessage<{
      cardIds: number[];
      playerId: string;
      gameId: string;
    }>({
      type: 'THROW_LEGION_CARD',
      cardIds: selectedCards.map((card) => card.card.id),
      playerId: playerId,
      gameId
    });
  };

  return (
    <>
      <section>Собран монстр легиона: {legionMode.legion}</section>
      {isMyTurn || legionMode.players[playerId]?.respondedCorrectly ? (
        <section>Ожидается сброс карт от других игроков</section>
      ) : (
        <section className="flex flex-col md:flex-row gap-2 items-center">
          <div>Сбросьте карту легиона {legionMode.legion} или две другие</div>
          <button
            onClick={handleThrowCards}
            disabled={!canThrowCards}
            title="Выберите одну или две карты чтобы сбросить">
            Сбросить
          </button>
        </section>
      )}
    </>
  );
};
