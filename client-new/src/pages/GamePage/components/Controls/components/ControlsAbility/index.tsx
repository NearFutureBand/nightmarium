import { useWebsocket } from 'src/modules/websocket';
import { ABILITIES, ABILITIES_DESCRIPTION } from '../../constants';
import { Axe } from './components/Axe';
import { Bones } from './components/Bones';
import { Wolf } from './components/Wolf';
import { FC } from 'react';
import { Drop } from './components/Drop';
import { Smile } from './components/Smile';
import { Teeth } from './components/Teeth';

const ABILITY_CONTROLS: { [key: number]: FC } = {
  0: () => <Wolf />,
  1: () => <Drop />,
  2: () => <Smile />,
  3: () => <Axe />,
  4: () => <Bones />,
  5: () => <Teeth />
};

export const ControlsAbility = () => {
  const ability = useWebsocket((s) => s.ability);
  const abilityDescription = ABILITIES_DESCRIPTION[ability!.abilityType];
  const abilityName = ABILITIES[ability!.abilityType];

  const Controls = ABILITY_CONTROLS[ability!.abilityType];

  return (
    <>
      <p>Способность: {abilityName}</p>
      <small>{abilityDescription}</small>
      {Controls && <Controls />}
    </>
  );
};
