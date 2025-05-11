import { useWebsocket } from 'src/modules/websocket';
import { MyCards } from './components/MyCards';
import { PlayerBoard } from './components/PlayerBoard';
import { Controls } from './components/Controls';

export const GamePage = () => {
  const game = useWebsocket((state) => state.game)!;

  const separation = Math.floor(game.otherPlayers.length / 2);
  const otherPlayersLeft = [...game.otherPlayers].slice(0, separation);
  const otherlayersRight = [...game.otherPlayers].slice(separation, game.otherPlayers.length);

  console.log(separation, otherPlayersLeft, otherlayersRight);

  return (
    <main className="pb-32">
      <Controls />
      <div className="flex relative perspective-distant overflow-visible">
        {otherPlayersLeft.map((player) => (
          <PlayerBoard player={player} key={player.id} className="player-board-0" />
        ))}
        <PlayerBoard player={game.me} myBoard className="my-player-board" />
        {otherlayersRight.map((player) => (
          <PlayerBoard player={player} key={player.id} className="player-board-1" />
        ))}
      </div>

      <MyCards />
    </main>
  );
};
