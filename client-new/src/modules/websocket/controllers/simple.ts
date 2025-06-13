import { Game, Message, MESSAGE_TYPE, Player } from 'src/types';
import { WebSocketStore } from '../types';

type DefaultMessagePayload = {
  me: Player;
  otherPlayers: Player[];
  game?: Game;
};

export type DefaultMessage = Message<DefaultMessagePayload>;

export type ExtendedMessage<T = {}> = Message<DefaultMessagePayload & T>;

const defaultControllerFor: MESSAGE_TYPE[] = [
  'START',
  'PLAY_CARD',
  'TAKE_CARD',
  'READY_TO_PLAY',
  'AWAIT_ABILITY',
  'EXCHANGE_CARDS',
  'AWAIT_LEGION_CARD',
  'THROW_LEGION_CARD'
];

export default (set: (nextState: Partial<WebSocketStore>) => void) => ({
  NAME_ACCEPTED: (m: DefaultMessage) => {
    set({ me: m.me });
  },
  PLAYER_CONNECTED: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers });
  },
  ...defaultControllerFor.reduce((config, messageType) => {
    config[messageType] = (m: DefaultMessage) => {
      set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
    };
    return config;
  }, {} as Partial<Record<MESSAGE_TYPE, (m: DefaultMessage) => void>>)
});
