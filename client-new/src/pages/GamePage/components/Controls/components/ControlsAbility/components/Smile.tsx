import { useSelection } from 'src/modules/selection/useSelection';
import { useAbility } from 'src/modules/websocket/hooks/useAbility';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { AbilityState } from 'src/types';

export const Smile = () => {
  const ability = useAbility() as AbilityState;
  const selectedCards = useSelection((s) => s.selectedCards);
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const resetSelectedCards = useSelection((s) => s.resetSelectedCards);
  const resetSelectedMonster = useSelection((s) => s.resetSelectedMonster);
  const sendMessage = useSendMessage();
  const gameId = useGameId() as string;

  const canPlayCard = Boolean(selectedMonster) && selectedCards.length === 1;

  const handlePlayCard = () => {
    if (!canPlayCard) return;
    sendMessage<{
      cardId: number;
      monsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: 'SUBMIT_ABILITY',
      abilityType: ability.abilityType,
      cardId: selectedCards[0].card.id,
      monsterId: selectedMonster!.monster.id,
      gameId
    });
    resetSelectedCards();
    resetSelectedMonster();
  };

  const handleNotAble = () => {
    sendMessage({
      type: 'CANCEL_ABILITY',
      gameId
    });
  };

  return (
    <div className="flex gap-2 items-center justify-center">
      <button
        onClick={handlePlayCard}
        disabled={!canPlayCard}
        title="Выберите карту с руки и монстра в которого хотели бы ее поставить">
        Выложить
      </button>
      <button onClick={handleNotAble} title="Если поставить ничего не можете - жмите сюда">
        Не могу выполнить
      </button>
    </div>
  );
};
