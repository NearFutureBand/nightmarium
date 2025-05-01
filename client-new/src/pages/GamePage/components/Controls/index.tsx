import { useWebsocket } from 'src/modules/websocket';
import { ControlsRegular } from './components/ControlsRegular';
import { ControlsAbility } from './components/ControlsAbility';

export const Controls = () => {
  const ability = useWebsocket((s) => s.ability);

  return (
    <header className="flex flex-col gap-2 p-2 justify-center items-center">
      {ability ? <ControlsAbility /> : <ControlsRegular />}
    </header>
  );
};
