import classNames from 'classnames';
import { FC } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectIsActive } from '../slices/App';
import { Card, Player } from '../types';
import { CardView } from './CardView';
import { MonsterView } from './MonsterView';

type Props = {
  player: Player;
  isMe: boolean;
};

export const PlayerBoard: FC<Props> = ({ player, isMe = false }) => {
  const isActive = useAppSelector(selectIsActive(player.id));

  return (
    <div className={classNames('playerBoard', { active: isActive })}>
      <header>
        {player.name} {player.id} {isMe && '( я )'}
      </header>
      <div className="monsters">
        {player.monsters.map((monster) => (
          <MonsterView
            key={monster.id}
            monster={monster}
            player={player}
            isMe={isMe}
          >
            {[0, 1, 2].map((bodypartIndex) => {
              const card: Card | undefined = monster?.body[bodypartIndex];
              return (
                <CardView
                  card={card}
                  key={bodypartIndex}
                  monster={monster}
                  player={player}
                  isMe={isMe}
                />
              );
            })}
          </MonsterView>
        ))}
      </div>
    </div>
  );
};
