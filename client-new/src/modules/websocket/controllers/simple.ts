import { AbilityState, Game, Message, Player } from 'src/types';
import { WebSocketStore } from '../types';

type DefaultMessagePayload = {
  me: Player;
  otherPlayers: Player[];
  game?: Game;
};

export type DefaultMessage = Message<DefaultMessagePayload>;

export type ExtendedMessage<T = {}> = Message<DefaultMessagePayload & T>;

export default (set: (nextState: Partial<WebSocketStore>) => void) => ({
  NAME_ACCEPTED: (m: DefaultMessage) => {
    set({ me: m.me });
  },
  START: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  },
  PLAYER_CONNECTED: (m: Message<{ me: Player; otherPlayers: Player[] }>) => {
    set({ me: m.me, otherPlayers: m.otherPlayers });
  },
  PLAY_CARD: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  },
  AWAIT_ABILITY: (m: ExtendedMessage<{ ability: AbilityState }>) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  }
});
