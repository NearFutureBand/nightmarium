import { MESSAGE_TYPE, ABILITY_TYPE } from './constants';

export type BodypartIndex = 0 | 1 | 2;

export type Legion = 'blue' | 'red' | 'orange' | 'green';

export type Card = {
  ability: ABILITY_TYPE | null;
  bodypart: BodypartIndex[];
  id: number;
  legion: Legion;
};

export type CardMap = { [cardId: string]: Card };

export type AbilityState = {
  cards?: Card[];
  abilityNumber: number;
  abilityType: number;
  actions: number;
};

export type LegionState = {
  legion: Legion;
  players: {
    [playerId: string]: {
      playerId: string;
      howManyCardsHas: number; // сколько карт у игрока есть ( не может отдать больше этого количества)
      gaveCards: number;
      respondedCorrectly: boolean;
    };
  };
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
  id: string;
  actions: number;
  lastAction: string | null;
  cardsAvailable: CardMap;
  cardsThrownAway: CardMap;
  playerId: string;
  me: Player<Card[]>;
  otherPlayers: Player<number>[];
  activePlayer?: Player<number>;
  winnerId?: string;
};

export type User = {
  id: string;
  name: string | null;
  gameId?: string;
  readyToPlay: boolean;
};

export type Message<T = {}> = T & {
  type: MESSAGE_TYPE;
};

export type MessageWithGame = Message<{ game: Game; me: User; otherPlayers: User[] }>;

export type MessageHandshake = MessageWithGame &
  Message<{
    me: User;
    otherPlayers: User[];
    ability?: AbilityState;
    legion?: LegionState;
  }>;

export type MessageAwaitAbility = MessageWithGame &
  Message<{
    ability: AbilityState;
  }>;

export type MessageGameOver = MessageWithGame & Message<{ winner: string }>;
export type MessagePlayerConnected = Message<{ otherPlayers: User[] }>;
export type MessageAwaitLegion = MessageWithGame & Message<{ legion: LegionState }>;

// DEVNOTE на случай если надо отедльно показывать какие карты пришли взамен
// export type MessageChangeCards = MessageWithGame & Message<{ cards: Card[] }>;

export type SelectedMonsterShort = {
  playerId: string;
  monsterId: number;
};

export type SelectedMonster = SelectedMonsterShort & {
  monsterBodyLength: number;
};

export type SelectedCardShort = {
  playerId?: string;
  monsterId?: number;
  cardId: number;
};

export type SelectedCard = SelectedCardShort & {
  cardBodypart: number[];
  legion: Legion;
};
