import { FC, KeyboardEventHandler, useCallback, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { MESSAGE_TYPE } from '../constants';
import { useSendMessage, useSocket } from '../hooks';
import { selectHowManyReadyToPlay, selectPlayerId } from '../slices/App';

type Props = {};

export const StartScreen: FC<Props> = () => {
  // Этот компонент не рендерится без me, поэтому тут playerId точно существует
  const playerId = useAppSelector(selectPlayerId)!;
  const playerName = useAppSelector((state) => state.app.me!.name);

  const { disconnect } = useSocket();
  const sendMessage = useSendMessage();

  const requestStartGame = useCallback(() => {
    sendMessage<{ playerId: string }>({ type: MESSAGE_TYPE.READY_TO_PLAY, playerId });
  }, [playerId, sendMessage]);

  return (
    <div className="start">
      <div className="App">
        <h1>Добро пожаловать в Кошмариум.</h1>
        {playerName ? `Привет, ${playerName}` : <NameInput />}. <StatusOfAwaitingPlayers /> <button onClick={requestStartGame}>Начать игру</button>
        <button onClick={disconnect}>Отключиться</button>
      </div>
    </div>
  );
};

function NameInput() {
  const [name, setName] = useState('');
  // Тут может быть восклицательный, только если компонент используется внутри StartScreen
  const playerId = useAppSelector(selectPlayerId)!;
  const sendMessage = useSendMessage();

  const onNameEnter: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        sendMessage({ type: MESSAGE_TYPE.SET_NAME, playerId, name });
      }
    },
    [name, playerId, sendMessage]
  );

  return (
    <>
      Представьтесь, пожалуйста: <input type="text" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={onNameEnter} />
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
