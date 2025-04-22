import { Game, Message, Player } from 'src/types';
import { WebSocketStore } from '../types';

type DefaultMessagePayload = {
  me: Player;
  otherPlayers: Player[];
  game?: Game;
};

export type DefaultMessage = Message<DefaultMessagePayload>;

export default (set: (nextState: Partial<WebSocketStore>) => void) => ({
  NAME_ACCEPTED: (m: DefaultMessage) => {
    set({ me: m.me });
  },
  START: (m: DefaultMessage) => {
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game });
  }
});
