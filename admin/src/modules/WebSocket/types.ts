import { Message } from "src/types";

export type SocketContextType = {
  connect: () => void;
  isConnected: boolean;
  sendMessage: <TMessage>(message: Message<TMessage>) => void;
};
