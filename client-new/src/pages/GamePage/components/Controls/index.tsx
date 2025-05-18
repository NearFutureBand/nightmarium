import { useWebsocket } from 'src/modules/websocket';
import { ControlsRegular } from './components/ControlsRegular';
import { ControlsAbility } from './components/ControlsAbility';
import { useIsTurn } from 'src/hooks/useIsTurn';

export const Controls = () => {
  const ability = useWebsocket((s) => s.ability);
  const { isMyTurn } = useIsTurn();

  if (!isMyTurn) {
    return null;
  }

  return (
    <header className="sticky top-0 left-0 flex flex-col p-2 justify-center items-center bg-bg-500 z-10 w-full">
      {ability ? <ControlsAbility /> : <ControlsRegular />}
    </header>
  );
};
