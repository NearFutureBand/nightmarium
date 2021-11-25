import React from 'react';

import { BODYPARTS, ABILITIES, COLORS } from '../../constants';
import { MONSTER_PART } from '../../img';
import { Monster } from '../Monster';
import { Card } from '../Card';

const MyCards = ({ cards }) => {

  return (
    <div className="my-cards">
      <div>My cards</div>
      <div className="cards">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            groupId={-1}
            placeId={index}
            //onClick={onSelectCardOnHand}
            //isSelected={selectedCardId === card.id}
          />
        ))}
      </div>
       
    </div>
  )
}

export { MyCards };