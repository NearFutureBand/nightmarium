import Monster from '../modules/Monster';
import {
  Legion,
  LegionPlayerState,
  LegionStateSerialized
} from 'src/modules/Game/GameModes/Legion/types';
import { AbilityStateSerialized } from 'src/modules/Game/GameModes/Abilities/types';

export type MessageType =
  | 'HANDSHAKE'
  | 'PLAYER_CONNECTED'
  | 'AWAIT_ABILITY'
  | 'START'
  | 'PLAY_CARD'
  | 'TAKE_CARD'
  | 'SUBMIT_ABILITY'
  | 'CANCEL_ABILITY'
  | 'GAME_OVER'
  | 'SET_NAME'
  | 'NAME_ACCEPTED'
  | 'AWAIT_LEGION_CARD'
  | 'THROW_LEGION_CARD'
  | 'EXCHANGE_CARDS'
  | 'READY_TO_PLAY'
  | 'LEAVE_GAME'
  | 'PLAYER_CONNECTED'
  | 'ADMIN_HANDSHAKE'
  | 'ADMIN_RESORT_CARDS';

export type Card = {
  id: number;
  ability: number | null;
  legion: Legion;
  bodypart: number[];
};

export type CardsDatabase = { [id: string]: Card };

export type Message<T = {}> = T & {
  type: MessageType;
};

export type PlayerState = {
  id: string;
  name: string | null;
  cards?: Card[];
  cardsCount?: number;
  monsters: Monster[];
  readyToPlay: boolean;
};

// export type AbilitiesMode = {
//   playerId: string;
//   monsterId: number;
//   sequence: (number | null)[];
//   currentAbilityState: AbilityState;
// };

export type GameState = {
  id: string;
  activePlayer?: PlayerState;
  me?: PlayerState;
  otherPlayers: PlayerState[];
  actions: number;
  lastAction: string | null;
  abilitiesMode?: AbilityStateSerialized;
  winnerId?: string | null;
  legionMode?: LegionStateSerialized;
};

// export type AbilityMessagePayload = {
//   cards?: Card[];
//   abilityNumber: number;
//   abilityType: number;
//   actions: number;
//   monsterId: number;
// };

// export type PossibleServerResponseMessage = Message<{
//   ability: AbilityMessagePayload;
// }> | void;

// export type AbiltityMessageOrUndefined = Message<{ ability: AbilityMessagePayload }> | undefined;

// export type ApplyAbilityHandler<T = {}> = (params: T) => PutCardReturnType | void;
