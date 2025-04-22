import { useWebsocket } from 'src/modules/websocket';
import { Card } from './Card';

export const MyCards = () => {
  const myCards = useWebsocket((state) => state.game?.me.cards);
  return (
    <div className="fixed flex gap-2 bottom-0 h-32 p-2 overflow-x-auto w-full">
      {myCards?.map((card) => (
        <Card id={card.id} key={card.id} />
      ))}
    </div>
  );
};
