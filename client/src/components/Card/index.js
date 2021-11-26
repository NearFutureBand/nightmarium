import React from 'react';

import { BODYPARTS, ABILITIES, COLORS } from '../../constants';
import { MONSTER_PART } from '../../img';

const Card = ({
  card,
  isSelected,
  isEmpty,
  groupId,
  placeId,
  isMonsterpart,
  onClick = () => {}
}) => {

  const _onClick = (event) => {
    onClick(event, card, groupId, placeId);
  }

  const image = MONSTER_PART[card.id];

  const style = {
    backgroundColor: COLORS[card.legion], cursor: (isMonsterpart && !isEmpty) ? 'auto' : undefined,
    backgroundImage: `url(${image})`,
  }

  if (isEmpty) {
    return <div className={`card empty ${isSelected ? 'selected' : ''}`} onClick={_onClick}/>
  }
  return (
    <div className={`card ${isSelected ? 'selected' : ''}`} style={style} onClick={_onClick}>
      {!image && (
        <>
          <div> id: {card.id}</div>
          <div> часть тела: {card.bodypart.map(bodypartIndex => BODYPARTS[bodypartIndex]).join(' | ')} </div>
          <div> способность: {ABILITIES[card.ability] || '-'} </div>
          <div> легион: {card.legion}</div>
        </>
      )}
    </div>
  )
}

export { Card };