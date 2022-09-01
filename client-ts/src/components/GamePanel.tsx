import { FC } from 'react';
import { useAppSelector } from '../app/hooks';

import { Controls } from './Controls';
import { MyCards } from './MyCards';
import { PlayerBoard } from './PlayerBoard';

type Props = {};

export const GamePanel: FC<Props> = () => {
  const game = useAppSelector((state) => state.app.game)!;
  const winnerId = useAppSelector((state) => state.app.winnerId);
  return (
    <div className="gamepanel">
      {winnerId && <h1>Победитель: {winnerId}</h1>}
      <Controls />
      <PlayerBoard player={game.me} isMe />
      {game.otherPlayers.map((player) => {
        return <PlayerBoard player={player} key={player.id} isMe={false} />;
      })}
      <MyCards />
    </div>
  );
};
