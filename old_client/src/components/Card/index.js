import React from 'react';

import './styles.scss';
import { BODYPARTS, ABILITIES, COLORS } from '../../constants';
import { MONSTER_PART } from '../../img';

const Card = ({
  card,
  isSelected,
  isEmpty,
  monsterId,
  isMonsterpart,
  zIndex,
  offset,
  clickable,
  onClick = () => {}
}) => {

  const _onClick = (event) => {
    onClick(event, card, monsterId);
  }

  const image = MONSTER_PART[card.id];

  const style = {
    backgroundColor: !image ? COLORS[card.legion] : undefined,
    backgroundImage: `url(${image})`,
    //marginLeft: `-${offset}rem`,
    //zIndex,
    //boxShadow: "1px 0px 1px black"
  }

  if (isEmpty) {
    return <div className={`card empty ${isSelected ? 'selected' : ''}`} onClick={_onClick}/>
  }
  return (
    <div className={`card ${isSelected ? 'selected' : ''} interactive ${clickable ? 'clickable' : ''}`} style={style} onClick={_onClick}>
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