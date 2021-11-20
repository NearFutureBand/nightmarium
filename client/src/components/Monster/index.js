import React from 'react';

const Monster = ({
  monster,
  isSelected,
  onClick = () => { },
  children
}) => {

  const _onClick = () => {
    if (monster.body.length !== 3) {
      onClick();
    }
  }

  return (
    <div className={`monster ${isSelected ? 'selected' : ''}`}onClick={_onClick}>
      {children}
    </div>
  )
}

export { Monster };