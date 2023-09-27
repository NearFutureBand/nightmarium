import { PropsWithChildren, createContext, useEffect, useRef } from "react";

const SERVER_HOST = import.meta.env.VITE_SERVER_HOST;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT;

const SocketContext = createContext(undefined);

export const SocketConnectProvider = ({ children }: PropsWithChildren) => {
  const socket = useRef<WebSocket>();

  useEffect(() => {
    const _socket = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}`);
    // _socket.onopen = () => onOpen(_socket);
    // _socket.onmessage = onMessage;
    // _socket.onerror = onError;
    socket.current = _socket;
  }, []);

  return (
    <SocketContext.Provider value={undefined}>
      {children}
    </SocketContext.Provider>
  );
};
