import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { GamePanel } from './components';
import { Loading } from './components/Loading';
import { StartScreen } from './components/StartScreen';
import { SocketContext, useInitSocket } from './hooks';
import { setAbilityState, setGame, setPlayerId, setWinner } from './slices/App';
import {
  MessageHandshake,
  MessageWithGame,
  MessageAwaitAbility,
  MessageGameOver,
} from './types';

function App() {
  const game = useAppSelector((state) => state.app.game);
  const playerId = useAppSelector((state) => state.app.playerId);

  const isGameStarted = useMemo(
    () => Boolean(game?.activePlayer),
    [game?.activePlayer]
  );

  if (!playerId) {
    return <Loading />;
  }

  if (!game || !isGameStarted) {
    return <StartScreen playerId={playerId} />;
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

  const onGameOver = useCallback(
    (message: MessageGameOver) => {
      dispatch(setGame(message.game));
      dispatch(setWinner(message.winner));
    },
    [dispatch]
  );

  const onPlayerConnected = useCallback(
    (message: MessageWithGame) => {
      dispatch(setGame(message.game));
      toast('A new player connected');
    },
    [dispatch]
  );

  const socket = useInitSocket({
    onHandshake,
    onPlayerConnected,
    onGameStart: updateGame,
    onPlayCard: updateGame,
    onTakeCard: updateGame,
    onAwaitAbility: onAwaitAbility,
    onGameOver,
    onNameAccepted: updateGame,
  });

  return (
    <SocketContext.Provider value={socket}>
      <App />
    </SocketContext.Provider>
  );
}

export default SocketConnectionLayer;
