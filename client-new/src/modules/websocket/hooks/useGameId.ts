import { useWebsocket } from '..';

export const useGameId = () => useWebsocket((s) => s.game?.id);
