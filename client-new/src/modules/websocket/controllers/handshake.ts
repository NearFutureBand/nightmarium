import { AbilityState, Game, Message, Player } from 'src/types';
import { WebSocketStore } from '../types';

export type MessageHandshake = Message<{
  me: Player;
  otherPlayers: Player[];
  game?: Game;
  ability?: AbilityState;
  // legion?: LegionState;
}>;

export default (set: (nextState: Partial<WebSocketStore>) => void) => ({
  HANDSHAKE: (m: MessageHandshake) => {
    localStorage.setItem('playerId', m.me.id);
    set({ me: m.me, otherPlayers: m.otherPlayers, game: m.game, ability: m.ability });
  }
});
