import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Games, MESSAGE_TYPE, Message, Users } from 'src/types';
import { SERVER_HOST, SERVER_PORT } from './constants';
import { WebSocketContext } from './context';
import { useStore } from '../Store';

export const SocketConnectProvider = ({ children }: PropsWithChildren) => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef<WebSocket>();
  const { setStore } = useStore();

  const onopen = () => {
    console.log('[websocket]: open');
    setIsConnected(true);
    socket.current?.send(JSON.stringify({ type: MESSAGE_TYPE.ADMIN_HANDSHAKE }));
  };

  const onmessage = (event: MessageEvent<unknown>) => {
    const m: Message<{ games: Games; users: Users }> = JSON.parse(event.data as string);
    console.log('TO ADMIN: message', m);
    setStore({ games: m.games, users: m.users });
  };

  const onerror = () => {
    console.log('[websocket]: error');
  };

  const connect = () => {
    const _socket = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}`);
    _socket.onopen = onopen;
    _socket.onmessage = onmessage;
    _socket.onerror = onerror;
    socket.current = _socket;
  };

  const sendMessage = <TMessage,>(message: Message<TMessage>) => {
    socket.current?.send(JSON.stringify(message));
  };

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      setIsConnected(false);
      socket.current?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connect, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
