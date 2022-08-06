import React from 'react';

import './styles.scss';
import { ABILITIES, ABILITIES_DESCRIPTION } from '../../constants';
import { Card } from '../Card';

const Controls = ({
  game,
  isMyTurn,
  awaitingAbility,
  onTakeCard,
  onPlaceCard,
  onSpecialCardClick,
  onSubmitAbility,
}) => {
  return (
    <div className="controls">
      {isMyTurn && typeof awaitingAbility.abilityType !== 'number' && (
        <>
          <span>
            Действий осталось: <strong>{game.actions}</strong>
          </span>
          <div className="buttons">
            <button onClick={onTakeCard}>Взять карту</button>
            <button onClick={onPlaceCard}>Выложить карту</button>
            {/* <button>Обменять (лучше не надо)</button> */}
          </div>
        </>
      )}

      {isMyTurn && typeof awaitingAbility.abilityType === 'number' && (
        <div>
          <div>
            Способность номер {awaitingAbility.abilityNumber + 1} -{' '}
            {ABILITIES[awaitingAbility.abilityType]}
          </div>
          <div style={{ display: 'flex' }}>
            {awaitingAbility.cards &&
              awaitingAbility.cards.map((card) => (
                <Card
                  card={card}
                  key={card.id}
                  onClick={onSpecialCardClick}
                  //isSelected={selectedCardId === card.id}
                />
              ))}
          </div>
          <div>{ABILITIES_DESCRIPTION[awaitingAbility.abilityType]}</div>
          <button onClick={onSubmitAbility}>
            {awaitingAbility.submitText}
          </button>
          <button>Не могу выполнить (TODO)</button>
        </div>
      )}
    </div>
  );
};

export { Controls };
