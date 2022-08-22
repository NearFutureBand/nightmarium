import { MESSAGE_TYPE } from '../constants';
import Monster from '../modules/Monster';

export type Card = {
  id: number;
  ability: number | null;
  legion: string;
  bodypart: number[];
};

export type CardsDatabase = { [id: string]: Card };

export type Message<T = {}> = T & {
  type: MESSAGE_TYPE;
};

export type PlayerState<CardsType> = {
  id: string;
  name: string | null;
  cards: CardsType;
  monsters: Monster[];
};

export type AbilitiesState = {
  playerId: string;
  monsterId: number;
  abilities: ({ type: number; done: boolean; inprogress: boolean } | null)[];
  currentAbilityIndex: number;
};

export type GameState = {
  cardsAvailable: CardsDatabase;
  cardsThrowedAway: CardsDatabase;
  activePlayer?: PlayerState<number>;
  me?: PlayerState<Card[]>;
  otherPlayers: PlayerState<number>[];
  actions: number;
  abilitiesState?: AbilitiesState;
};

export type AbilityDropData = {
  cards: Card[];
};

export type AbilitySmileData = {
  cardId: number;
  monsterId: number;
};

export type AbilityAxeData = {
  targetPlayerId: string;
  targetMonsterId: number;
};

export type ApplyAbilityParams = {
  abilityNumber: number;
  abilityType: number;
} & AbilityDropData &
  AbilitySmileData &
  AbilityAxeData;
