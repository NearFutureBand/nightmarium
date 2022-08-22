import { MESSAGE_TYPE, ABILITY_TYPE } from './constants';

export type BodypartIndex = 0 | 1 | 2;

export type Card = {
  ability: ABILITY_TYPE | null;
  bodypart: BodypartIndex[];
  id: number;
  legion: 'blue' | 'red' | 'orange' | 'green';
};

export type CardMap = { [cardId: string]: Card };

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
  players: Player<number>[];
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
