import { Game } from 'src/types';
import { useWebsocket } from '..';

export const useGameData = () => useWebsocket((s) => s.game || ({} as Game));
