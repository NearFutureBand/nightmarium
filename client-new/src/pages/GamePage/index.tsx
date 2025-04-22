import { useWebsocket } from 'src/modules/websocket';
import { Card } from './components/Card';
import { MyCards } from './components/MyCards';

export const GamePage = () => {
  // const game = useWebsocket((state) => state.game)!;

  return (
    <>
      {/* {game.me.cards?.map((card) => (
        <Card id={card.id} key={card.id} />
      ))} */}
      <MyCards />
    </>
  );
};
