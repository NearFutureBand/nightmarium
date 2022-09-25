import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { Connection, GamePanel, Loading, StartScreen } from './components';
import { SocketContext, useInitSocket } from './hooks';
import {
  setAbilityState,
  setAwaitingLegion,
  setGame,
  setPlayerId,
  setWinner,
} from './slices/App';
import {
  MessageHandshake,
  MessageWithGame,
  MessageAwaitAbility,
  MessageGameOver,
  MessageAwaitLegion,
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
  const isConnected = useAppSelector((state) => state.network.isConnected);

  const onHandshake = useCallback(
    (message: MessageHandshake) => {
      dispatch(setPlayerId(message.playerId));
      dispatch(setGame(message.game));
      if (message.ability) {
        dispatch(setAbilityState(message.ability));
      }
      if (message.legion) {
        dispatch(setAwaitingLegion(message.legion));
      }
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
      dispatch(setAwaitingLegion(null));
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
      toast('Подключился еще один игрок');
    },
    [dispatch]
  );

  const onAwaitLegionCard = useCallback(
    (message: MessageAwaitLegion) => {
      dispatch(setGame(message.game));
      dispatch(setAwaitingLegion(message.legion));
      //toast(`Full ${message.legion.legion} monster!`); // TODO it works stupid
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
    onAwaitLegionCard,
  });

  return (
    <SocketContext.Provider value={socket}>
      {isConnected ? <App /> : <Connection />}
    </SocketContext.Provider>
  );
}

export default SocketConnectionLayer;
