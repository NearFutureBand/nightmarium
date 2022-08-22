import { FC } from 'react';
import { Card, Game } from '../types';
import { CardEmpty } from './CardEmpty';
import { CardView } from './CardView';
import { Monster } from './Monster';
import { MyCards } from './MyCards';

type Props = {
  game: Game;
};

export const GamePanel: FC<Props> = ({ game }) => {
  return (
    <div className="gamepanel">
      <div className="monsters">
        {game.me.monsters.map((monster) => (
          <Monster key={monster.id}>
            {[0, 1, 2].map((bodypartIndex) => {
              const card: Card | undefined = monster?.body[bodypartIndex];
              return card ? (
                <CardView
                  key={bodypartIndex}
                  card={card}
                  monsterId={monster.id}
                />
              ) : (
                <CardEmpty key={bodypartIndex} />
              );
            })}
          </Monster>
        ))}
      </div>

      <MyCards cards={game.me.cards} />
    </div>
  );
};
