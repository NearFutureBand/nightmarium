import { MonsterType } from 'src/types';
import { Card } from './Card';
import { Monster } from './Monster';
import { useIsTurn } from 'src/hooks/useIsTurn';
import { useSelection } from 'src/modules/selection/useSelection';
import { useAbility } from 'src/modules/websocket/hooks/useAbility';

export const Monsters = ({
  monsters,
  myMonsters = false,
  playerId
}: {
  monsters: MonsterType[];
  myMonsters?: boolean;
  playerId: string;
}) => {
  const { isMyTurn } = useIsTurn();
  const selectMonster = useSelection((s) => s.selectMonster);
  const selectedMonster = useSelection((s) => s.selectedMonster);
  const ability = useAbility();
  return (
    <div className="flex gap-2 w-full">
      {monsters.map((monster) => {
        return (
          <Monster
            key={monster.id}
            id={monster.id}
            onClick={() => {
              selectMonster({ monster, playerId });
            }}
            isSelected={
              monster.id === selectedMonster?.monster.id && selectedMonster.playerId === playerId
            }
            selectable={isMyTurn && myMonsters}
            isActive={isMyTurn && ability?.monsterId === monster.id}>
            {monster.body.map((card) => (
              <Card
                key={card.id}
                id={card.id}
                card={card}
                disabled
                monsterId={monster.id}
                playerId={playerId}
              />
            ))}
          </Monster>
        );
      })}
    </div>
  );
};
