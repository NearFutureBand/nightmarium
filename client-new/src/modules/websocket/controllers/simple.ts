import { AbilityState, Game, Message, Player } from 'src/types';
import { WebSocketStore } from '../types';

type DefaultMessagePayload = {
  me: Player;
  otherPlayers: Player[];
  game?: Game;
  ability?: AbilityState;
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
  PLAY_CARD: (m: ExtendedMessage<{ ability: AbilityState }>) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game, ability: m.ability });
  },
  TAKE_CARD: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  },
  READY_TO_PLAY: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  },
  AWAIT_ABILITY: (m: ExtendedMessage<{ ability: AbilityState }>) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game, ability: m.ability });
  },
  EXCHANGE_CARDS: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  }
});
