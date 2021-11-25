import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { BODYPARTS, ABILITIES, COLORS } from '../../constants';
import { MONSTER_PART } from '../../img';
import { Monster } from '../Monster';
import { Card } from '../Card';

import { getSelectedMonsterId, selectMonster } from '../../slices';

const PlayerBoard = ({ player = {}, isMine }) => {
  const dispatch = useDispatch();

  const selectedMonsterId = useSelector(getSelectedMonsterId);

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
              isSelected={selectedMonsterId === monsterIndex}
              key={monsterIndex}
              onClick={() => dispatch(selectMonster({ monsterId: monsterIndex }))}
            >
              {[0, 1, 2].map((bodypartIndex) => {
                const card = monster?.body[bodypartIndex];
                if (card) {
                  return (
                    <Card
                      key={bodypartIndex}
                      card={card}
                      isEmpty={!card}
                      groupId={monsterIndex}
                      placeId={bodypartIndex}
                      //onClick={onMonsterCardClick}
                      //isSelected={placeSelectedOnMonster.groupId === monsterIndex && placeSelectedOnMonster.placeId === bodypartIndex}
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