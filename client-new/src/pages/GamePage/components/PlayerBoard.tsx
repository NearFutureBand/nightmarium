import { Player } from 'src/types';
import { Monsters } from './Monsters';

export const PlayerBoard = ({ player }: { player: Player }) => {
  return (
    <section className="p-2 flex flex-col gap-2">
      <h1>{player.name}</h1>
      <small>{player.id}</small>
      <Monsters monsters={player.monsters!} />
    </section>
  );
};
