import { useWebsocket } from 'src/modules/websocket';
import { useGameData } from 'src/modules/websocket/hooks/useGameData';

export const useIsTurn = () => {
  const { activePlayer } = useGameData();
  const me = useWebsocket((s) => s.me);

  const getIsTurn = (playerId: string) => playerId === activePlayer?.id;

  const isMyTurn = me?.id === activePlayer?.id;

  return { getIsTurn, isMyTurn };
};
