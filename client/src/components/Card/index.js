import React from 'react';

import { BODYPARTS, ABILITIES, COLORS } from '../../constants';

const Card = ({
  card,
  isSelected,
  isEmpty,
  groupId,
  placeId,
  disabled,
  isMonsterpart,
  onClick = () => {}
}) => {

  const _onClick = () => {
    if (!disabled || (isMonsterpart && !isEmpty)) {
      onClick(card, groupId, placeId);
    }
  }

  if (isEmpty) {
    return <div className={`card empty ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} onClick={_onClick}/>
  }
  return (
    <div className={`card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} style={{ backgroundColor: COLORS[card.legion], cursor: (isMonsterpart && ! isEmpty) ? 'auto' : undefined }} onClick={_onClick}>
      <div> id: {card.id}</div>
      <div> часть тела: {card.bodypart.map(bodypartIndex => BODYPARTS[bodypartIndex]).join(' | ')} </div>
      <div> способность: {ABILITIES[card.ability] || '-'} </div>
      <div> легион: {card.legion}</div>
    </div>
  )
}

export { Card };