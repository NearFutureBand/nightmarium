import { useWebsocket } from 'src/modules/websocket';
import { MyCards } from './components/MyCards';
import { PlayerBoard } from './components/PlayerBoard';
import { Controls } from './components/Controls';

export const GamePage = () => {
  const game = useWebsocket((state) => state.game)!;

  return (
    <main className="pb-32">
      <Controls />
      <PlayerBoard player={game.me} />
      {game.otherPlayers.map((player) => (
        <PlayerBoard player={player} key={player.id} />
      ))}
      <MyCards />
    </main>
  );
};
