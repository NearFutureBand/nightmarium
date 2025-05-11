import { Player } from 'src/types';
import { Monsters } from './Monsters';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import clsx from 'clsx';

export const PlayerBoard = ({
  player,
  myBoard = false,
  className
}: {
  player: Player;
  myBoard?: boolean;
  className?: string;
}) => {
  const { activePlayer } = useGameData();

  const isTurn = player.id === activePlayer?.id;
  const isMyTurn = myBoard && isTurn;

  return (
    <section
      className={clsx('p-2 w-full flex flex-col gap-2', { ' bg-bg-600': isTurn }, className)}>
      <h1>
        {player.name}
        {isMyTurn && ', ваш ход'}
      </h1>
      <small>{player.id}</small>
      <Monsters monsters={player.monsters!} />
    </section>
  );
};
