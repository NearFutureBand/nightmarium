import { useSelection } from 'src/modules/selection/useSelection';
import { useAbility } from 'src/modules/websocket/hooks/useAbility';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { Card } from 'src/pages/GamePage/components/Card';
import { AbilityState } from 'src/types';

export const Wolf = () => {
  const ability = useAbility() as AbilityState;
  const selectedCards = useSelection((s) => s.selectedCards);
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const resetSelectedCards = useSelection((s) => s.resetSelectedCards);
  const resetSelectedMonster = useSelection((s) => s.resetSelectedMonster);
  const sendMessage = useSendMessage();
  const gameId = useGameId() as string;

  const canThrowOff = selectedCards.length > 0;
  const canPlayCard = Boolean(selectedMonster) && selectedCards.length === 1;

  const handleThrowOff = () => {
    if (!canThrowOff) return;
    sendMessage<{
      abilityType: number;
      action_experimental?: string;
      cardIds: number[];
      gameId: string;
    }>({
      type: 'SUBMIT_ABILITY',
      abilityType: ability.abilityType,
      action_experimental: 'THROW OFF',
      cardIds: selectedCards.map((c) => c.card.id),
      gameId
    });
  };

  const handlePlayCard = () => {
    if (!canPlayCard) return;
    sendMessage<{
      cardIds: number[];
      monsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: 'SUBMIT_ABILITY',
      abilityType: ability.abilityType,
      cardIds: [selectedCards[0].card.id],
      monsterId: selectedMonster!.monster.id,
      gameId
    });
    resetSelectedCards();
    resetSelectedMonster();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center w-auto [&>img]:h-24 pt-2 gap-2">
        {ability.cards!.map((card) => (
          <Card card={card} id={card.id} key={card.id} />
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <span>
          Карта {selectedCards[0]?.card.id || '-'} в монстра{' '}
          {selectedMonster ? selectedMonster?.monster.id + 1 : '-'}
        </span>
        <button
          onClick={handlePlayCard}
          disabled={!canPlayCard}
          title="Выберите карту из выданных и кликните на монстра в которого хотите ее установить">
          Выложить
        </button>
        <button
          onClick={handleThrowOff}
          disabled={!canThrowOff}
          title="Выберите одну или обе карты которые не можете использовать и сбросьте">
          Сбросить карт{selectedCards.length === 1 ? 'у' : 'ы'}
        </button>
      </div>
    </div>
  );
};
