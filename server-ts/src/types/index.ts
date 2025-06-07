import { PutCardReturnType } from 'src/modules/Game/GameActions/types';
import Monster from '../modules/Monster';
// import { MESSAGE_TYPE } from '../shared/types';

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
  | 'PLAYER_CONNECTED';

export type Legion = 'red' | 'orange' | 'blue' | 'green';

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

export type AbilityState = {
  type: number | null;
  index: number; // Индекс способности в монстре ( 0 - 3 )
  done: boolean; // Выполнена способность или нет - в целом пока бесполезно
  inprogress: boolean;
  actions: number; // Сколько действий осталось внутри этой способности, нужно для сложных сп. таких как Волк
  cards?: Card[]; // Карты, выдаваемые внутри способности. Будут храниться здесь, чтобы оперировать только индексами карт
};

export type AbilitiesMode = {
  playerId: string;
  monsterId: number;
  sequence: (number | null)[];
  currentAbilityState: AbilityState;
};

export type GameState = {
  id: string;
  activePlayer?: PlayerState;
  me?: PlayerState;
  otherPlayers: PlayerState[];
  actions: number;
  lastAction: string | null;
  abilitiesMode?: AbilitiesMode;
  winnerId?: string | null;
};

export type ApplyAbilityParams = {
  abilityNumber: number;
  abilityType: number;
} & AbilityWolfData &
  AbilityDropData &
  AbilitySmileData &
  AbilityAxeData &
  AbilityBonesData &
  AbilityTeethData;

export type AbilityMessagePayload = {
  cards?: Card[];
  abilityNumber: number;
  abilityType: number;
  actions: number;
  monsterId: number;
};

export type LegionPlayerState = {
  playerId: string;
  howManyCardsHas: number; // сколько карт у игрока есть ( не может отдать больше этого количества)
  gaveCards: number;
  respondedCorrectly: boolean;
};

export type LegionMessagePayload = {
  legion: Legion;
  players: { [playerId: string]: LegionPlayerState };
};

export type PossibleServerResponseMessage = Message<{
  ability: AbilityMessagePayload;
}> | void;

export type AbiltityMessageOrUndefined = Message<{ ability: AbilityMessagePayload }> | undefined;

export type ApplyAbilityHandler<T = {}> = (params: T) => PutCardReturnType | void;
