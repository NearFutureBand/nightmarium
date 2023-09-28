import { FC } from 'react';
import { useAppSelector } from '../app/hooks';
import { CardView } from './CardView';

type Props = {};

export const MyCards: FC<Props> = () => {
  const me = useAppSelector((state) => state.app.game!.me);
  const myCards = me.cards;

  return (
    <div className="my-cards">
      {myCards.map((card) => (
        <CardView card={card} key={card.id} cardOnHand player={me} />
      ))}
    </div>
  );
};
