import { useMemo } from 'react';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';
import { Legion } from 'src/types';

export function LastStep() {
  const { lastAction } = useGameData();

  const parsed = useMemo(() => {
    if (!lastAction) return '';
    if (/CHANGE_CARDS/.test(lastAction)) {
      return 'смена карт';
    }
    if (/TAKE_CARD/.test(lastAction)) {
      return 'взята карта';
    }
    const [, legion] = lastAction.split(':') as [string, Legion];
    return (
      <>
        сыграна карта легиона <strong>{legion}</strong>
      </>
    );
  }, [lastAction]);

  return lastAction ? <span>Последний ход: {parsed}</span> : null;
}
