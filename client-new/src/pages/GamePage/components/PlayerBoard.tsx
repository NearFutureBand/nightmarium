import { Player } from 'src/types';
import { Monsters } from './Monsters';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import clsx from 'clsx';
import { useIsTurn } from 'src/hooks/useIsTurn';

export const PlayerBoard = ({
  player,
  myBoard = false,
  className
}: {
  player: Player;
  myBoard?: boolean;
  className?: string;
}) => {
  const { getIsTurn, isMyTurn } = useIsTurn();
  const isTurn = getIsTurn(player.id);

  return (
    <section
      className={clsx(
        'p-4 w-full flex flex-col gap-2 rounded-4xl',
        { ' bg-bg-600': isTurn },
        className
      )}>
      <h1>
        {isTurn && !myBoard && 'Ходит '}
        {player.name}
        {isMyTurn && myBoard && ', ваш ход'}
      </h1>
      <small>{player.id}</small>
      <Monsters monsters={player.monsters!} myMonsters={myBoard} />
    </section>
  );
};
