import { useWebsocket } from 'src/modules/websocket';
import { StatusOfAwaitingPlayers } from 'src/components/StatusOfAwaitingPlayers';

export const LoadingPage = () => {
  const myName = useWebsocket((state) => state.me?.name);
  const playerId = useWebsocket((state) => state.me?.id);
  const disconnect = useWebsocket((state) => state.disconnect);

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center gap-6">
      <h1>В игру врывается {myName}</h1>
      <div className="flex gap-2 items-center">
        Ожидаем готовности других игроков.
        <button onClick={disconnect}>Отключиться</button>
      </div>
      <div className="w-3 aspect-square border animate-spin"></div>
      <div className="flex gap-1 flex-col items-center">
        <StatusOfAwaitingPlayers />
        <small>Player id: {playerId}</small>
      </div>
    </div>
  );
};
