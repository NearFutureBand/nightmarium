import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { HOST, MESSAGE_TYPE, PORT } from '../constants';
import {
  Message,
  MessageAwaitAbility,
  MessageAwaitLegion,
  MessageGameOver,
  MessageHandshake,
  MessageWithGame,
} from '../types';

type Params = {
  onHandshake: (message: MessageHandshake) => void;
  onPlayerConnected: (message: MessageWithGame) => void;
  onGameStart: (message: MessageWithGame) => void;
  onPlayCard: (message: MessageWithGame) => void;
  onTakeCard: (message: MessageWithGame) => void;
  onAwaitAbility: (message: MessageAwaitAbility) => void;
  onGameOver: (message: MessageGameOver) => void;
  onNameAccepted: (message: MessageWithGame) => void;
  onAwaitLegionCard: (message: MessageAwaitLegion) => void;
};

export const useInitSocket = ({
  onHandshake,
  onPlayerConnected,
  onGameStart,
  onPlayCard,
  onAwaitAbility,
  onGameOver,
  onNameAccepted,
  onAwaitLegionCard,
}: Params) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const _onHandshake = useCallback(
    (message: MessageHandshake) => {
      localStorage.setItem('playerId', message.playerId);
      onHandshake?.(message);
    },
    [onHandshake]
  );
  const _onGameStart = useCallback(
    (message: MessageWithGame) => {
      onGameStart?.(message);
    },
    [onGameStart]
  );

  const messageHandlersMap = useMemo(() => {
    return {
      [MESSAGE_TYPE.HANDSHAKE]: (m: Message) =>
        _onHandshake(m as MessageHandshake),
      [MESSAGE_TYPE.PLAYER_CONNECTED]: (m: Message) =>
        onPlayerConnected(m as MessageWithGame),
      [MESSAGE_TYPE.START]: (m: Message) => _onGameStart(m as MessageWithGame),
      [MESSAGE_TYPE.PLAY_CARD]: (m: Message) =>
        onPlayCard(m as MessageWithGame),
      [MESSAGE_TYPE.TAKE_CARD]: (m: Message) =>
        onPlayCard(m as MessageWithGame),
      [MESSAGE_TYPE.AWAIT_ABILITY]: (m: Message) =>
        onAwaitAbility(m as MessageAwaitAbility),
      [MESSAGE_TYPE.SUBMIT_ABILITY]: () => {},
      [MESSAGE_TYPE.CANCEL_ABILITY]: () => {},
      [MESSAGE_TYPE.GAME_OVER]: (m: Message) =>
        onGameOver(m as MessageGameOver),
      [MESSAGE_TYPE.SET_NAME]: () => {},
      [MESSAGE_TYPE.NAME_ACCEPTED]: (m: Message) =>
        onNameAccepted(m as MessageWithGame),
      [MESSAGE_TYPE.AWAIT_LEGION_CARD]: (m: Message) =>
        onAwaitLegionCard(m as MessageAwaitLegion),
      [MESSAGE_TYPE.THROW_LEGION_CARD]: () => {},
    };
  }, [
    _onHandshake,
    onPlayerConnected,
    _onGameStart,
    onPlayCard,
    onAwaitAbility,
    onGameOver,
    onNameAccepted,
    onAwaitLegionCard,
  ]);

  const onOpen = useCallback((socket: WebSocket) => {
    const playerId = localStorage.getItem('playerId');
    console.log('CLIENT: connected', playerId);
    socket.send(JSON.stringify({ type: 'HANDSHAKE', playerId }));
  }, []);

  const onMessage = useCallback(
    (event: MessageEvent<any>) => {
      const m: Message = JSON.parse(event.data);
      console.log('CLIENT: message', m);
      messageHandlersMap[m.type](m);
    },
    [messageHandlersMap]
  );

  useEffect(() => {
    const _socket = new WebSocket(`ws://${HOST}:${PORT}`);
    _socket.onopen = () => onOpen(_socket);
    _socket.onmessage = onMessage;
    setSocket(_socket);

    return () => {
      console.log('CLIENT disconnecting');
      _socket.close(); // WTF ??
      socket?.close();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socket;
};

export const SocketContext =
  createContext<ReturnType<typeof useInitSocket>>(null);

export const useSocket = () => useContext(SocketContext);

export const useSendMessage = () => {
  const socket = useSocket();

  const sendMessage = <MessagePayloadT>(message: Message<MessagePayloadT>) => {
    try {
      socket?.send(JSON.stringify(message));
    } catch (error) {
      console.log(error);
    }
  };

  return sendMessage;
};
