import { MonsterType } from 'src/types';
import { Card } from './Card';
import { Monster } from './Monster';

export const Monsters = ({ monsters }: { monsters: MonsterType[] }) => {
  return (
    <div className="flex gap-2 w-full overflow-x-auto">
      {monsters.map((monster) => {
        return (
          <Monster key={monster.id} id={monster.id}>
            {monster.body.map((card) => (
              <Card key={card.id} id={card.id} card={card} />
            ))}
          </Monster>
        );
      })}
    </div>
  );
};
