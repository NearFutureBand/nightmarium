import { ControlsRegular } from './components/ControlsRegular';
import { ControlsAbility } from './components/ControlsAbility';
import { useIsTurn } from 'src/hooks/useIsTurn';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import { PropsWithChildren } from 'react';
import { ControlsLegion } from './components/ControlsLegion';

export const Controls = () => {
  const { abilitiesMode, legionMode } = useGameData();
  const { isMyTurn } = useIsTurn();

  if (legionMode) {
    return (
      <Header>
        <ControlsLegion />
      </Header>
    );
  }

  if (!isMyTurn) {
    return null;
  }

  if (abilitiesMode) {
    return (
      <Header>
        <ControlsAbility />
      </Header>
    );
  }

  return (
    <Header>
      <ControlsRegular />
    </Header>
  );
};

function Header({ children }: PropsWithChildren) {
  return (
    <header className="sticky top-0 left-0 flex flex-col p-2 justify-center items-center bg-bg-500 z-10 w-full">
      {children}
    </header>
  );
}
