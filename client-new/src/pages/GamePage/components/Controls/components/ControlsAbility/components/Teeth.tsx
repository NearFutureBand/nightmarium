import { useSelection } from 'src/modules/selection/useSelection';
import { useAbility } from 'src/modules/websocket/hooks/useAbility';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { AbilityState } from 'src/types';

export const Teeth = () => {
  const ability = useAbility() as AbilityState;
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const resetSelectedMonster = useSelection((s) => s.resetSelectedMonster);
  const sendMessage = useSendMessage();
  const gameId = useGameId() as string;

  const canRemoveCard = Boolean(selectedMonster);

  const handleRemoveCard = () => {
    if (!canRemoveCard) return;
    sendMessage<{
      targetMonsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: 'SUBMIT_ABILITY',
      abilityType: ability.abilityType,
      targetMonsterId: selectedMonster!.monster.id,
      gameId
    });
    resetSelectedMonster();
  };

  const handleNotAble = () => {
    sendMessage({
      type: 'CANCEL_ABILITY',
      gameId
    });
  };

  return (
    <div className="flex gap-2 items-center">
      {selectedMonster && <span>Верхняя карта монстра {selectedMonster.monster.id + 1}</span>}
      <button
        onClick={handleRemoveCard}
        disabled={!canRemoveCard}
        title="Кликните на монстра с которого будет снята верхняя карта">
        Убрать
      </button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
};
