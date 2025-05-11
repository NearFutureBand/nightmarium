import { useWebsocket } from 'src/modules/websocket';
import { ABILITIES, ABILITIES_DESCRIPTION } from '../../constants';
import { Axe } from './components/Axe';
import { Bones } from './components/Bones';
import { Wolf } from './components/Wolf';
import { FC } from 'react';

const ABILITY_CONTROLS: { [key: number]: FC } = {
  0: () => <Wolf />,
  // 1: <ControlsDrop />,
  // 2: <ControlsSmile />,
  3: () => <Axe />,
  4: () => <Bones />
  // 5: <ControlsTeeth />
};

export const ControlsAbility = () => {
  const ability = useWebsocket((s) => s.ability);
  const abilityDescription = ABILITIES_DESCRIPTION[ability!.abilityType];
  const abilityName = ABILITIES[ability!.abilityType];

  const Controls = ABILITY_CONTROLS[ability!.abilityType];

  return (
    <>
      <p>Способность: {abilityName}</p>
      <p>{abilityDescription}</p>
      {Controls && <Controls />}
    </>
  );
};
