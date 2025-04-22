import { create } from 'zustand';
import { toast } from 'react-toastify';
import { Message, MESSAGE_TYPE } from 'src/types';
import { saveHostAndPort } from 'src/utils/saveHostAndPort';
import { WebSocketStore } from './types';
import handshakeHandler from './controllers/handshake';
import simpleMessageHandlers from './controllers/simple';

export const useWebsocket = create<WebSocketStore>((set) => {
  let socket: WebSocket | null;

  const messageHandlers: Partial<Record<MESSAGE_TYPE, (m: Message<any>) => void>> = {
    ...handshakeHandler(set),
    ...simpleMessageHandlers(set)
  };

  const handleMessage = (event: MessageEvent<unknown>) => {
    const m: Message = JSON.parse(event.data as string);
    console.log('[CLIENT: message]', m);
    if (m.type in messageHandlers) {
      messageHandlers[m.type]?.(m);
    }
  };

  const handleOpen = ({ host, port }: { host: string; port: string }) => {
    if (!socket) return;
    set(() => ({ connected: true }));
    const playerId = localStorage.getItem('playerId');
    socket.send(JSON.stringify({ type: 'HANDSHAKE', playerId }));
    saveHostAndPort(host, port);
    toast(`Успешно подключен к  ${socket.url}`);
  };

  const disconnect = () => {
    if (!socket) return;
    socket.close();
    set(() => ({ connected: false }));
    // clearPortAndHost();
  };

  return {
    connected: false,
    game: null,
    me: null,
    otherPlayers: [],
    connect: (host: string, port: string) => {
      const _socket = new WebSocket(`ws://${host}:${port}`);
      _socket.onopen = () => handleOpen({ host, port });
      _socket.onmessage = handleMessage;
      // socket.onerror = onError;
      socket = _socket;
    },
    sendMessage: (message) => {
      socket?.send(JSON.stringify(message));
    },
    disconnect
  };
});
