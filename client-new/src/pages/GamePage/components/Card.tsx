import { MONSTER_PART } from 'src/img';

export const Card = ({ id }: { id: number }) => {
  return (
    <img
      alt={`Moster card number ${id}`}
      src={MONSTER_PART[id]}
      className="aspect-[204/131] max-w-2xs"
    />
  );
};
