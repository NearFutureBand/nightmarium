import { useRef } from "react";
import { useWebsocket } from "src/modules/websocket";
import { useSendMessage } from "src/modules/websocket/hooks/useSendMessage";

export const StartPage = () => {
  const myName = useWebsocket((state) => state.me?.name);
  const playerId = useWebsocket(state => state.me?.id);
  const disconnect = useWebsocket(state => state.disconnect);
  const sendMessage = useSendMessage();

  const handleStart = () => {
    if (!myName) return;
    if (!playerId) return;
    sendMessage<{ playerId: string }>({
      type: 'READY_TO_PLAY',
      playerId,
    });
  }

  return (
     <div className='min-h-dvh flex flex-col justify-center items-center gap-6'>
      <h1>Добро пожаловать в Кошмариум.</h1>
      <div className="flex gap-2 items-center">
        {myName ? `Привет, ${myName}` : <NameInput />}.{" "}
         <StatusOfAwaitingPlayers />{" "}
        {myName && <button onClick={handleStart}>Начать игру</button>}
        <button onClick={disconnect}>Отключиться</button>
      </div>
      <small>Player id: {playerId}</small>
    </div>
  )
}

function NameInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const playerId = useWebsocket(state => state.me?.id);
  const sendMessage = useSendMessage();

  const handleSubmitName: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (playerId && inputRef.current?.value) {
      sendMessage({ type: 'SET_NAME', playerId: playerId, name: inputRef.current?.value || ''});
    }
  };

  return (
    <form className="flex gap-2 items-center" onSubmit={handleSubmitName}>
      Представьтесь, пожалуйста:{" "}
      <input
        type='text'
        ref ={inputRef}
        maxLength={50}
      />
      <button type="submit">Сохранить имя</button>
    </form>
  );
}

function StatusOfAwaitingPlayers() {
  const otherPlayers = useWebsocket((state) => state.otherPlayers);
  const amIReadyToPlay = useWebsocket(state => state.me?.readyToPlay);

  const readyToPlayCount = otherPlayers.reduce(
      (count, player) => (player.readyToPlay ? count + 1 : count),
      0
    ) + (amIReadyToPlay ? 1 : 0)

  return (
    <>
      Готово игроков: {readyToPlayCount}/{otherPlayers.length + 1}
    </>
  );
}
