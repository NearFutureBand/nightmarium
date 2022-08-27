import { FC } from 'react';
import { useAppSelector } from '../app/hooks';
import { CardView } from './CardView';

type Props = {};

export const MyCards: FC<Props> = () => {
  const cards = useAppSelector((state) => state.app.game!.me.cards);
  return (
    <div className="my-cards">
      {cards.map((card) => (
        <CardView card={card} key={card.id} />
      ))}
    </div>
  );
};
