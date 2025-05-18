import { useSelection } from 'src/modules/selection/useSelection';
import { useAbility } from 'src/modules/websocket/hooks/useAbility';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { AbilityState } from 'src/types';

/** TODO продолжать тут - создал стейт для поддержки выбранного монстра и карты */
export const Bones = () => {
  const ability = useAbility() as AbilityState;
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const resetSelectedMonster = useSelection((s) => s.resetSelectedMonster);
  const sendMessage = useSendMessage();
  const gameId = useGameId() as string;
  const canKillMonster = Boolean(selectedMonster);

  const handleKillMonster = () => {
    if (!canKillMonster) return;
    sendMessage<{
      targetPlayerId: string;
      targetMonsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: 'SUBMIT_ABILITY',
      abilityType: ability.abilityType,
      targetPlayerId: selectedMonster!.playerId,
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
    <>
      {selectedMonster && (
        <span>
          {selectedMonster.playerId}: {selectedMonster.monster.id + 1}-й монстр
        </span>
      )}
      <div className="flex gap-2 items-center justify-center">
        <button
          onClick={handleKillMonster}
          disabled={!canKillMonster}
          title="Кликните на любого чужого недостроенного монстра чтобы убить его">
          Убить
        </button>
        <button onClick={handleNotAble} title="Жмите сюда, если убить некого">
          Не могу выполнить
        </button>
      </div>
    </>
  );
};
