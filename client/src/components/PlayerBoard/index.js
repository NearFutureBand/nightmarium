import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { BODYPARTS, ABILITIES, COLORS } from '../../constants';
import { MONSTER_PART } from '../../img';
import { Monster } from '../Monster';
import { Card } from '../Card';

import {
  getSelectedMonsterId, selectMonster, selectCard, getSelectedCardId
} from '../../slices';

const PlayerBoard = ({ player = {}, isMyTurn, awaitingAbility, itsMe }) => {
  const dispatch = useDispatch();

  const selectedMonsterId = useSelector(getSelectedMonsterId);
  const selctedCardId = useSelector(getSelectedCardId);

  const onSelectMonster = (monsterId) => {
    if (isMyTurn && itsMe) {
      dispatch(selectMonster({ monsterId: monsterId, playerId: player.id }));
    }
    if (isMyTurn && !itsMe && awaitingAbility.abilityType === 4) {
      dispatch(selectMonster({ monsterId, playerId: player.id }));
    }
  }

  const onCardClick = (event, card, monsterId) => {
    if (isMyTurn && awaitingAbility.abilityType === 5) {
      // зубы
      event.stopPropagation();
      dispatch(selectCard({ cardId: card.id, monsterId, playerId: null }));
    }
    if (isMyTurn && !itsMe && awaitingAbility.abilityType === 3) {
      // топор
      event.stopPropagation();
      dispatch(selectCard({ cardId: card.id, monsterId, playerId: player.id }));
    }
    if (isMyTurn && !itsMe && awaitingAbility.abilityType === 4) {
      // кости
      event.stopPropagation();
      dispatch(selectMonster({ monsterId, playerId: player.id }));
    }

  }

  if (!player.monsters) {
    return null;
  }

  return (
    <div className="board">
      <div>{player.id}</div>
      <div className="monsters">
        {[0, 1, 2, 3, 4].map((monsterIndex) => {
          const monster = player.monsters[monsterIndex];
          return (
            <Monster
              monster={monster}
              isSelected={selectedMonsterId[0] === monsterIndex && selectedMonsterId[1] === player.id}
              key={monsterIndex}
              onClick={() => onSelectMonster(monsterIndex)}
            >
              {[0, 1, 2].map((bodypartIndex) => {
                const card = monster?.body[bodypartIndex];
                if (card) {
                  return (
                    <Card
                      key={bodypartIndex}
                      card={card}
                      isEmpty={!card}
                      monsterId={monsterIndex}
                      onClick={onCardClick}
                      isSelected={selctedCardId[0] === card.id}
                      isMonsterpart
                    />
                  )
                }
                return null;
              })}
            </Monster>
          )
        })}
      </div>
    </div>
  )
}

export { PlayerBoard };