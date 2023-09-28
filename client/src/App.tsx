import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { useAppSelector } from "./hooks/useAppSelector";
import { generateRandomBackground } from "./helpers";
import {
  selectAmIReadyToPlay,
  selectPlayerId,
  setAbilityState,
  setAwaitingLegion,
  setGame,
  setMe,
  setOtherPlayers,
} from "./slices/App";
import {
  MessageHandshake,
  MessageWithGame,
  MessageAwaitAbility,
  MessageAwaitLegion,
  User,
  Message,
  MessagePlayerConnected,
} from "./types";
import { SocketContext, useInitSocket } from "./hooks/useWebsocket";
import { Loading } from "./components/Loading";
import { StartScreen } from "./components/StartScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { GamePanel } from "./components/GamePanel";
import { Connection } from "./components/Connection";

const backgroundColor = generateRandomBackground();

function Router() {
  const game = useAppSelector((state) => state.app.game);
  const playerId = useAppSelector(selectPlayerId);
  const winnerId = game?.winnerId;
  const imReadyToPlay = useAppSelector(selectAmIReadyToPlay);

  const noActivePlayer = useMemo(
    () => !game?.activePlayer,
    [game?.activePlayer]
  );

  if (!playerId) {
    return <Loading fullscreen />;
  }

  if (!imReadyToPlay) {
    return <StartScreen />;
  }

  if (noActivePlayer && imReadyToPlay && !winnerId) return <LoadingScreen />;

  return <GamePanel />;
}

function SocketConnectionLayer() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector((state) => state.network.isConnected);

  const onHandshake = useCallback(
    (message: MessageHandshake) => {
      dispatch(setMe(message.me));
      dispatch(setOtherPlayers(message.otherPlayers));
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

  const onNameAccepted = useCallback(
    (message: Message<{ me: User }>) => {
      dispatch(setMe(message.me));
    },
    [dispatch]
  );

  const updateGame = useCallback(
    (message: MessageWithGame) => {
      dispatch(setGame(message.game));
      dispatch(setMe(message.me));
      dispatch(setOtherPlayers(message.otherPlayers));
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

  const onPlayerConnected = useCallback(
    (message: MessagePlayerConnected) => {
      dispatch(setOtherPlayers(message.otherPlayers));
      toast("Подключился еще один игрок");
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
    onGameOver: updateGame,
    onNameAccepted,
    onAwaitLegionCard,
    onChangeCards: updateGame,
    onReadyToPlay: updateGame,
    onLeaveGame: updateGame,
  });

  return (
    <main className='main-page' style={{ backgroundColor }}>
      <SocketContext.Provider value={socket}>
        {isConnected ? <Router /> : <Connection />}
      </SocketContext.Provider>
    </main>
  );
}

export default SocketConnectionLayer;
