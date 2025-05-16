import { useWebsocket } from 'src/modules/websocket';
import { MyCards } from './components/MyCards';
import { PlayerBoard } from './components/PlayerBoard';
import { Controls } from './components/Controls';

export const GamePage = () => {
  const game = useWebsocket((state) => state.game)!;

  const separation = Math.ceil(game.otherPlayers.length / 2);
  const otherPlayersLeft = [...game.otherPlayers].slice(0, separation);
  const otherlayersRight = [...game.otherPlayers].slice(separation, game.otherPlayers.length);

  return (
    <main className="pb-32 pt-[80px]">
      <Controls />
      <div className="flex relative perspective-distant overflow-x-scroll overflow-y-visible p-10">
        {otherPlayersLeft.map((player) => (
          <PlayerBoard
            player={player}
            key={player.id}
            className="px-2 rotate-y-[30deg] scale-80 translate-x-[25%]"
          />
        ))}
        <PlayerBoard player={game.me} myBoard className="scale-80 z-10" />
        {otherlayersRight.map((player) => (
          <PlayerBoard player={player} key={player.id} />
        ))}
      </div>

      <MyCards />
    </main>
  );
};
