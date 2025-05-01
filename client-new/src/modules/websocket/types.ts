import { AbilityState, Game, Message, Player } from 'src/types';

export type WebSocketStore = {
  connected: boolean;
  game: Game | null;
  me: Player | null;
  otherPlayers: Player[];
  ability?: AbilityState;
  connect: (host: string, port: string) => void;
  sendMessage: <MessagePayloadT>(message: Message<MessagePayloadT>) => void;
  disconnect: () => void;
};
