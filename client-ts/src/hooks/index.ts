import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MESSAGE_TYPE } from '../constants';
import { Message, MessageHandshake, MessageWithGame } from '../types';

type Params = {
  onHandshake?: (message: MessageHandshake) => void;
  onGameStart?: (message: MessageWithGame) => void;
};

export const useSocket = ({ onHandshake, onGameStart }: Params) => {
  const socket = useRef<WebSocket | null>(null);

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
      [MESSAGE_TYPE.AWAIT_ABILITY]: () => {},
      [MESSAGE_TYPE.START]: (m: Message) => _onGameStart(m as MessageWithGame),
    };
  }, [_onHandshake, _onGameStart]);

  const onOpen = useCallback(() => {
    const playerId = localStorage.getItem('playerId');
    console.log('CLIENT: connected', playerId);
    socket.current?.send(JSON.stringify({ type: 'HANDSHAKE', playerId }));
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
    socket.current = new WebSocket('ws://localhost:9000');

    socket.current.onopen = onOpen;

    socket.current.onmessage = onMessage;

    return () => {
      socket.current?.close();
      socket.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socket.current;
};
