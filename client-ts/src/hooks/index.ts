import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../app/hooks';
import { MESSAGE_TYPE } from '../constants';
import { setIsConnected, setNetworkLoading } from '../slices/Network';
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
  const dispatch = useAppDispatch();
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

  const onOpen = useCallback(
    (socket: WebSocket) => {
      dispatch(setNetworkLoading(false));
      dispatch(setIsConnected(true));
      const playerId = localStorage.getItem('playerId');
      console.log('CLIENT: connected', playerId);
      socket.send(JSON.stringify({ type: 'HANDSHAKE', playerId }));
      saveServerAddress({ url: socket.url });
      toast(`Connected successfully to ${socket.url}`);
    },
    [dispatch]
  );

  const onMessage = useCallback(
    (event: MessageEvent<any>) => {
      const m: Message = JSON.parse(event.data);
      console.log('CLIENT: message', m);
      messageHandlersMap[m.type](m);
    },
    [messageHandlersMap]
  );

  const onError = useCallback(
    (event: Event) => {
      console.log('websocket error', event);
      if ((event.target as WebSocket).readyState === 3) {
        console.log('websocket connection failed');
        dispatch(setNetworkLoading(false));
        clearServerAddress();
        toast('Connection failed');
      }
    },
    [dispatch]
  );

  const connect = useCallback(
    (host: string, port: number) => {
      const _socket = new WebSocket(`ws://${host}:${port}`);
      _socket.onopen = () => onOpen(_socket);
      _socket.onmessage = onMessage;
      _socket.onerror = onError;
      setSocket(_socket);
    },
    [onError, onMessage, onOpen]
  );

  const disconnect = useCallback(() => {
    console.log('CLIENT disconnecting');
    socket?.close();
    setSocket(null);
    clearServerAddress();
    dispatch(setIsConnected(false));
    toast('Disconnected from server');
  }, [dispatch, socket]);

  useEffect(() => {
    const { host, port } = getSavedServerAddress();
    if (host && port) {
      console.log('fount autosaved host and port, connecting');
      dispatch(setNetworkLoading(true));
      connect(host, parseInt(port));
    }
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket, connect, disconnect };
};

export const SocketContext = createContext<ReturnType<
  typeof useInitSocket
> | null>(null);

export const useSocket = () => useContext(SocketContext)!;

export const useSendMessage = () => {
  const { socket } = useSocket();

  const sendMessage = <MessagePayloadT>(message: Message<MessagePayloadT>) => {
    try {
      socket?.send(JSON.stringify(message));
    } catch (error) {
      console.log(error);
    }
  };

  return sendMessage;
};

// helpers

function getSavedServerAddress(): { host?: string; port?: string } {
  const host = localStorage.getItem('host');
  const port = localStorage.getItem('port');
  return { host: host || undefined, port: port || undefined };
}

function saveServerAddress({
  port,
  host,
  url,
}: {
  port?: string | number;
  host?: string;
  url?: string;
}) {
  let _port = port;
  let _host = host;
  if (url) {
    const { host, port } = getHostAndPortFromAddress(url);
    _port = port;
    _host = host;
  }

  if (!_port || !_host) {
    console.log('port or host has no value: ', { _port, _host });
    return;
  }
  localStorage.setItem('port', `${_port}`);
  localStorage.setItem('host', _host);
}

function clearServerAddress() {
  localStorage.removeItem('port');
  localStorage.removeItem('host');
}

function getHostAndPortFromAddress(url: string): {
  host: string;
  port: string;
} {
  const result = url.match(/\/\/(([0-9]{1,3}.){3}[0-9]{1,3}):([0-9]{2,10})\//);
  if (!result) {
    throw new Error(`unable to find host and port from given url: ${url}`);
  }
  return { host: result[1], port: result[3] };
}
