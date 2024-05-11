import { Card } from 'src/types';
import { ABILITIES, BODYPARTS } from './constants';

// TODO цвета
export const CardView = ({ card }: { card: Card }) => {
  return (
    <div className="w-40 h-20 border border-slate-700 p-2 shrink-0">
      <div className="flex justify-between">
        <strong className="text-lg">{card.id}</strong>
        <div>{card.ability !== null ? ABILITIES[card.ability] : ''} </div>
      </div>
      <span className="text-sm">
        {card.bodypart.map((bodypartIndex) => BODYPARTS[bodypartIndex]).join(' | ')}
      </span>
    </div>
  );
};
