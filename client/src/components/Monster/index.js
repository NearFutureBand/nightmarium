import React from 'react';

import './styles.scss';

const Monster = ({
  monster,
  isSelected,
  onClick = () => { },
  children,
  clickable,
  bodyLength = 0,
  awaitingAbility,
  itsMe
}) => {

  const _onClick = () => {
    if (clickable) {
      onClick();
    }
  }

  const optionalClasses = [
    `${isSelected ? 'selected' : ''}`,
    `${clickable ? 'clickable' : ''}`,
    `${bodyLength ? 'inprogress' : ''}`,
    `${awaitingAbility.abilityType === 3 && !itsMe ? 'allow-select-card' : ''}`,
  ].join(' ');

  return (
    <div className={`monster ${optionalClasses}`} onClick={_onClick}>
      {children}
    </div>
  )
}

export { Monster };