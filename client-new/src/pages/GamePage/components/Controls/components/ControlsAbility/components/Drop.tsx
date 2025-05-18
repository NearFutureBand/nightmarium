import { useAbility } from 'src/modules/websocket/hooks/useAbility';
import { useGameId } from 'src/modules/websocket/hooks/useGameId';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { Card } from 'src/pages/GamePage/components/Card';
import { AbilityState } from 'src/types';

export const Drop = () => {
  const ability = useAbility() as AbilityState;
  const sendMessage = useSendMessage();
  const gameId = useGameId() as string;

  const handleTakeCards = () => {
    sendMessage<{
      abilityType: number;
      gameId: string;
    }>({
      type: 'SUBMIT_ABILITY',
      abilityType: ability.abilityType,
      gameId
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center w-auto [&>img]:h-24 pt-2 gap-2">
        {ability.cards!.map((card) => (
          <Card card={card} id={card.id} key={card.id} />
        ))}
      </div>
      <div className="flex gap-2 items-center justify-center">
        <button onClick={handleTakeCards}>Забрать</button>
      </div>
    </div>
  );
};
