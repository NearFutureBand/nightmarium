import { MonsterType } from 'src/types';
import { Card } from './Card';
import { Monster } from './Monster';
import { useIsTurn } from 'src/hooks/useIsTurn';

export const Monsters = ({
  monsters,
  myMonsters = false
}: {
  monsters: MonsterType[];
  myMonsters?: boolean;
}) => {
  const { isMyTurn } = useIsTurn();
  return (
    <div className="flex gap-2 w-full">
      {monsters.map((monster) => {
        return (
          <Monster key={monster.id} id={monster.id}>
            {monster.body.map((card) => (
              <Card key={card.id} id={card.id} card={card} disabled />
            ))}
          </Monster>
        );
      })}
    </div>
  );
};
