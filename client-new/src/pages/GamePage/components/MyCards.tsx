import { useWebsocket } from 'src/modules/websocket';
import { Card } from './Card';
import { useIsTurn } from 'src/hooks/useIsTurn';

export const MyCards = () => {
  const myCards = useWebsocket((state) => state.game?.me.cards);
  const { isMyTurn } = useIsTurn();
  return (
    <div className="fixed flex flex-row-reverse justify-end gap-2 bottom-0 h-32 p-2 pt-4 overflow-y-visible overflow-x-auto w-full bg-bg-500/90 [&>img]:ml-[-20px] [&>img]:relative">
      {myCards?.map((card) => (
        <Card id={card.id} card={card} key={card.id} disabled={!isMyTurn} hoverEffect />
      ))}
    </div>
  );
};
