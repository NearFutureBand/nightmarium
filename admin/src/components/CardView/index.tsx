import { Card } from 'src/types';
import { ABILITIES, BODYPARTS } from './constants';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type CardViewProps = HTMLAttributes<HTMLDivElement> & {
  card: Card;
  index: number;
};

export const CardView = ({
  card,
  index,
  className,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragOver,
  ...containerProps
}: CardViewProps) => {
  return (
    <div
      className={twMerge(
        'min-w-[200px] w-full max-w-[300px] h-20 border border-slate-700 bg-slate-400 p-2 shrink-0 z-0 relative',
        className
      )}
      draggable
      style={{ backgroundColor: LEGIONS[card.legion] }}
      {...containerProps}
    >
      <div className="flex justify-between">
        <strong className="text-lg">
          ({index}) {card.id}
        </strong>
        <div>{card.ability !== null ? ABILITIES[card.ability] : ''} </div>
      </div>
      <span className="text-sm">
        {card.bodypart.map((bodypartIndex) => BODYPARTS[bodypartIndex]).join(' | ')}
      </span>
      <div
        className="z-[1] absolute top-0 left-0 w-full h-full"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragOver={onDragOver}
      ></div>
    </div>
  );
};

const LEGIONS = {
  'green': 'rgb(111, 194, 111)',
  'red': 'rgb(226, 88, 88)',
  'blue': 'rgb(92, 92, 218)',
  'orange': 'rgb(210, 210, 68)'
}