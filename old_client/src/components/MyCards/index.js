import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './style.scss';
import { BODYPARTS, ABILITIES, COLORS } from '../../constants';
import { MONSTER_PART } from '../../img';
import { Monster } from '../Monster';
import { Card } from '../Card';
import { selectCard, getSelectedCardId } from '../../slices';


const MyCards = ({ cards }) => {

  const dispatch = useDispatch();

  const selectedCardId = useSelector(getSelectedCardId);

  const onSelectCardOnHand = (event, card) => {
    dispatch(selectCard({ cardId: card.id, monsterId: null, playerId: null }));
  };

  const cardOffset = cards.length >= 6 ? cards.length / 6 : 0;

  return (
    <div className="my-cards">
      <h3>Мои карты</h3>
      <div className="cards">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={onSelectCardOnHand}
            isSelected={selectedCardId[0] === card.id}
            offset={cardOffset}
            zIndex={cards.length - index}
          />
        ))}
      </div>
       
    </div>
  )
}

export { MyCards };