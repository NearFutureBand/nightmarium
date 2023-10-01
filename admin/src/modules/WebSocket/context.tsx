import {
  PropsWithChildren,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SocketContextType } from "./types";
import { SERVER_HOST, SERVER_PORT } from "./constants";
import { MESSAGE_TYPE, Message } from "src/types";

const DEFAULT_VALUE: SocketContextType = {
  connect: () => {},
  isConnected: false,
  sendMessage: () => {},
};

export const SocketContext = createContext<SocketContextType>(DEFAULT_VALUE);

export const SocketConnectProvider = ({ children }: PropsWithChildren) => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef<WebSocket>();

  const onopen = () => {
    console.log("[websocket]: open");
    setIsConnected(true);
    socket.current?.send(
      JSON.stringify({ type: MESSAGE_TYPE.HANDSHAKE, playerId: "admin" })
    );
  };

  const onmessage = () => {
    console.log("[websocket]: message");
  };

  const onerror = () => {
    console.log("[websocket]: error");
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
    };
  }, []);

  return (
    <SocketContext.Provider value={{ connect, isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
