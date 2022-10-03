import { FC, KeyboardEventHandler, useCallback, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { MESSAGE_TYPE } from '../constants';
import { useSendMessage, useSocket } from '../hooks';

type Props = {
  playerId: string;
};

export const StartScreen: FC<Props> = ({ playerId }) => {
  const game = useAppSelector((state) => state.app.game);
  const { disconnect } = useSocket();
  const sendMessage = useSendMessage();
  const [name, setName] = useState('');

  const playerName = game?.me.name;

  const startGame = useCallback(() => {
    sendMessage({ type: MESSAGE_TYPE.START });
  }, [sendMessage]);

  const onNameEnter: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        sendMessage({ type: MESSAGE_TYPE.SET_NAME, playerId, name });
      }
    },
    [name, playerId, sendMessage]
  );

  return (
    <div className="start">
      <div className="App">
        <h1>Добро пожаловать в Кошмариум.</h1>
        {playerName ? (
          `Привет, ${playerName}`
        ) : (
          <>
            Представьтесь, пожалуйста: <input type="text" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={onNameEnter} />
          </>
        )}
        . Игроков: {game!.otherPlayers.length + 1} <button onClick={startGame}>Начать игру</button>
        <button onClick={disconnect}>Отключиться</button>
      </div>
    </div>
  );
};
