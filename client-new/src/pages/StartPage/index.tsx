import { useWebsocket } from 'src/modules/websocket';
import { useSendMessage } from 'src/modules/websocket/hooks/useSendMessage';
import { NameInput } from './components/NameInput';
import { StatusOfAwaitingPlayers } from 'src/components/StatusOfAwaitingPlayers';

export const StartPage = () => {
  const myName = useWebsocket((state) => state.me?.name);
  const playerId = useWebsocket((state) => state.me?.id);
  const disconnect = useWebsocket((state) => state.disconnect);
  const sendMessage = useSendMessage();

  const handleStart = () => {
    if (!myName) return;
    if (!playerId) return;
    sendMessage<{ playerId: string }>({
      type: 'READY_TO_PLAY',
      playerId
    });
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center gap-6 p-2 text-balance">
      <h1>Добро пожаловать в Кошмариум.</h1>
      <div className="flex gap-2 items-center flex-col md:flex-row">
        {myName ? `Привет, ${myName}` : <NameInput />}
        <span className="hidden md:block">.</span>
        {myName && <button onClick={handleStart}>Начать игру</button>}
        <button onClick={disconnect}>Отключиться</button>
      </div>
      <div className="flex gap-1 flex-col items-center">
        <StatusOfAwaitingPlayers />
        <small>Player id: {playerId}</small>
      </div>
    </div>
  );
};
