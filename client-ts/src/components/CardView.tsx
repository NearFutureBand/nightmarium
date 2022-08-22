import { FC, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Card } from '../types';
import { MONSTER_PART } from '../img';
import { ABILITIES, BODYPARTS, COLORS } from '../constants';

type Props = {
  card: Card;
  monsterId?: number;
  clickable?: boolean;
  selected?: boolean;
};

export const CardView: FC<Props> = ({
  card,
  monsterId,
  clickable = false,
  selected = false,
}) => {
  const [_selected, setSelected] = useState(selected);

  const image = MONSTER_PART[card.id];

  const style = useMemo(() => {
    return {
      backgroundColor: !image ? COLORS[card.legion] : undefined,
      backgroundImage: `url(${image})`,
      //marginLeft: `-${offset}rem`,
      //zIndex,
      //boxShadow: "1px 0px 1px black"
    };
  }, [card.legion, image]);

  const handleClick = useCallback(() => {
    setSelected((selected) => !selected);
  }, []);

  return (
    <div
      className={classNames('card', { clickable, selected: _selected })}
      style={style}
      onClick={handleClick}
      draggable={clickable}
    >
      {!image && (
        <>
          <div> id: {card.id}</div>
          <div>
            {' '}
            часть тела:{' '}
            {card.bodypart
              .map((bodypartIndex) => BODYPARTS[bodypartIndex])
              .join(' | ')}{' '}
          </div>
          <div>
            {' '}
            способность: {card.ability ? ABILITIES[card.ability] : '-'}{' '}
          </div>
          <div> легион: {card.legion}</div>
        </>
      )}
    </div>
  );
};
