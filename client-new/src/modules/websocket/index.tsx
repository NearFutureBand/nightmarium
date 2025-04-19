import { create } from "zustand";
import { toast } from 'react-toastify';
import { Game, Message, MESSAGE_TYPE, MessageHandshake, MessageNameAccepted, MessageWithGame, Player } from "src/types";
import { saveHostAndPort } from "src/utils/saveHostAndPort";

type WebSocketStore = {
  connected: boolean;
  game: Game | null;
  me: Player | null;
  otherPlayers: Player[];
  connect: (host: string, port: string) => void;
  sendMessage: <MessagePayloadT, >(message: Message<MessagePayloadT>) => void;
  disconnect: () => void;
}

export const useWebsocket = create<WebSocketStore>((set) => {
  let socket: WebSocket | null;

  const messageHandlers: Partial<Record<MESSAGE_TYPE, (m: Message) => void>> = {
    'HANDSHAKE': (m: Message) => handleHandshake(m as MessageHandshake),
    'NAME_ACCEPTED': (m: Message) => handleNameAccepted(m as MessageNameAccepted),
    'START': (m: Message) => handleStartGame(m as MessageWithGame)
  }

  const handleMessage = (event: MessageEvent<unknown>) => {
    const m: Message = JSON.parse(event.data as string);
    console.log('[CLIENT: message]', m);
    if (m.type in messageHandlers) {
      messageHandlers[m.type]?.(m);
    }
  };

  const handleHandshake = (m: MessageHandshake) => {
    localStorage.setItem('playerId', m.me.id);
    set(() => ({ me: m.me, otherPlayers: m.otherPlayers, game: m.game }));
  }

  const handleNameAccepted = (m: MessageNameAccepted) => {
    set(() => ({ me: m.me }));
  }

  const handleStartGame = (m: MessageWithGame) => {
    set(() => ({ me: m.me, otherPlayers: m.otherPlayers, game: m.game }));
  }

  //

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
  }

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
      // setSocket(socket);
      socket = _socket;
    },
    sendMessage: (message) => {
      socket?.send(JSON.stringify(message));
    },
    disconnect,
    // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    // removeAllBears: () => set({ bears: 0 }),
  }
})