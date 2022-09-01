import { MESSAGE_TYPE, ABILITY_TYPE } from './constants';

export type BodypartIndex = 0 | 1 | 2;

export type Card = {
  ability: ABILITY_TYPE | null;
  bodypart: BodypartIndex[];
  id: number;
  legion: 'blue' | 'red' | 'orange' | 'green';
};

export type CardMap = { [cardId: string]: Card };

// TODO make generic
export type AbilityState = {
  abilityNumber: number;
  abilityType: number;
  cards?: Card[];
  monsterId?: number;
  playerId: string;
};

export type Monster = {
  id: number;
  body: Card[];
  abilitiesUsed: boolean;
};

export type Player<CardsType = number | Card[]> = {
  id: string;
  name: string | null;
  monsters: Monster[];
  cards: CardsType;
};

export type Game = {
  actions: number;
  cardsAvailable: CardMap;
  cardsThrownAway: CardMap;
  playerId: string;
  me: Player<Card[]>;
  otherPlayers: Player<number>[];
  activePlayer?: Player<number>;
};

export type Message<T = {}> = T & {
  type: MESSAGE_TYPE;
};

export type MessageWithGame = Message<{ game: Game }>;

export type MessageHandshake = MessageWithGame &
  Message<{
    playerId: string;
  }>;

export type MessageAwaitAbility = MessageWithGame &
  Message<{
    ability: AbilityState;
  }>;

export type MessageGameOver = MessageWithGame & Message<{ winner: string }>;

export type SelectedMonster = {
  playerId: string;
  monsterId: number;
};

export type SelectedCard = {
  playerId?: string;
  monsterId?: number;
  cardId: number;
};
