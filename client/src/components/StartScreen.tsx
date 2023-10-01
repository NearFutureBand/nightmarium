import { FC, KeyboardEventHandler, useCallback, useState } from "react";
import { useAppSelector } from "src/hooks/useAppSelector";
import { MESSAGE_TYPE } from "src/constants";
import { useSendMessage, useSocket } from "src/hooks/useWebsocket";
import { selectHowManyReadyToPlay, selectUserId } from "src/slices/App";

export const StartScreen: FC = () => {
  // Этот компонент не рендерится без me, поэтому тут userId точно существует
  const userId = useAppSelector(selectUserId)!;
  const playerName = useAppSelector((state) => state.app.me!.name);

  const { disconnect } = useSocket();
  const sendMessage = useSendMessage();

  const requestStartGame = useCallback(() => {
    sendMessage<{ userId: string }>({
      type: MESSAGE_TYPE.READY_TO_PLAY,
      userId,
    });
  }, [userId, sendMessage]);

  return (
    <div className='start'>
      <div className='App'>
        <h1>Добро пожаловать в Кошмариум.</h1>
        {playerName ? `Привет, ${playerName}` : <NameInput />}.{" "}
        <StatusOfAwaitingPlayers />{" "}
        <button onClick={requestStartGame}>Начать игру</button>
        <button onClick={disconnect}>Отключиться</button>
      </div>
    </div>
  );
};

function NameInput() {
  const [name, setName] = useState("");
  // Тут может быть восклицательный, только если компонент используется внутри StartScreen
  const userId = useAppSelector(selectUserId)!;
  const sendMessage = useSendMessage();

  const onNameEnter: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === "Enter") {
        sendMessage({ type: MESSAGE_TYPE.SET_NAME, userId, name });
      }
    },
    [name, userId, sendMessage]
  );

  return (
    <>
      Представьтесь, пожалуйста:{" "}
      <input
        type='text'
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={onNameEnter}
      />
    </>
  );
}

function StatusOfAwaitingPlayers() {
  const otherPlayers = useAppSelector((state) => state.app.otherPlayers);
  const readyToPlayCount = useAppSelector(selectHowManyReadyToPlay);
  return (
    <>
      Готово игроков: {readyToPlayCount}/{otherPlayers.length + 1}
    </>
  );
}
