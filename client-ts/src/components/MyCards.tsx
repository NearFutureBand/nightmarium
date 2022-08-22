import { FC } from 'react';
import { Card } from '../types';
import { CardView } from './CardView';

type Props = {
  cards: Card[];
};

export const MyCards: FC<Props> = ({ cards }) => {
  return (
    <div className="my-cards">
      {cards.map((card) => (
        <CardView card={card} key={card.id} clickable />
      ))}
    </div>
  );
};
