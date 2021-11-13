import React from 'react';

import { BODYPARTS, ABILITIES, COLORS } from '../../constants';

const Card = ({
  card,
  isSelected,
  isEmpty,
  groupId,
  placeId,
  onClick = () => {}
}) => {

  const _onClick = () => {
    onClick(card, groupId, placeId);
  }

  if (isEmpty) {
    return <div className={`card empty ${isSelected ? 'selected' : ''}`} onClick={_onClick}/>
  }
  return (
    <div className={`card ${isSelected ? 'selected' : ''}`} style={{ backgroundColor: COLORS[card.legion] }} onClick={_onClick}>
      <div> id: {card.id}</div>
      <div> часть тела: {BODYPARTS[card.bodypart]} </div>
      <div> способность: {ABILITIES[card.ability] || '-'} </div>
      <div> легион: {card.legion}</div>
    </div>
  )
}

export { Card };