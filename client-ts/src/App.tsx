import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { GamePanel } from './components';
import { MESSAGE_TYPE } from './constants';
import { SocketContext, useInitSocket, useSendMessage } from './hooks';
import { setAbilityState, setGame, setPlayerId } from './slices/App';
import {
  MessageHandshake,
  MessageWithGame,
  MessageAwaitAbility,
} from './types';

function App() {
  const game = useAppSelector((state) => state.app.game);
  const playerId = useAppSelector((state) => state.app.playerId);

  const isGameStarted = useMemo(
    () => Boolean(game?.activePlayer),
    [game?.activePlayer]
  );

  const sendMessage = useSendMessage();

  const startGame = useCallback(() => {
    sendMessage({ type: MESSAGE_TYPE.START });
  }, [sendMessage]);

  if (!playerId) {
    return <div>Идёт обновление идентификатора игрока</div>;
  }

  if (!game || !isGameStarted) {
    return (
      <div className="App">
        Привет, {playerId}. <button onClick={startGame}>Начать игру</button>
      </div>
    );
  }

  return <GamePanel />;
}

function SocketConnectionLayer() {
  const dispatch = useAppDispatch();

  const onHandshake = useCallback(
    (message: MessageHandshake) => {
      dispatch(setPlayerId(message.playerId));
      dispatch(setGame(message.game));
    },
    [dispatch]
  );

  const updateGame = useCallback(
    (message: MessageWithGame) => {
      dispatch(setGame(message.game));
      dispatch(setAbilityState(null));
    },
    [dispatch]
  );

  const onAwaitAbility = useCallback(
    (message: MessageAwaitAbility) => {
      dispatch(setGame(message.game));
      dispatch(setAbilityState(message.ability));
    },
    [dispatch]
  );

  const socket = useInitSocket({
    onHandshake,
    onGameStart: updateGame,
    onPlayCard: updateGame,
    onTakeCard: updateGame,
    onAwaitAbility: onAwaitAbility,
  });

  return (
    <SocketContext.Provider value={socket}>
      <App />
    </SocketContext.Provider>
  );
}

export default SocketConnectionLayer;
