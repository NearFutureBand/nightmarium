export type MESSAGE_TYPE = "HANDSHAKE" | "PLAYER_CONNECTED" | "AWAIT_ABILITY" | "START" |
  "PLAY_CARD" | "TAKE_CARD" | "SUBMIT_ABILITY" | "CANCEL_ABILITY" | "GAME_OVER" |
  "SET_NAME" | "NAME_ACCEPTED" | "AWAIT_LEGION_CARD" | "THROW_LEGION_CARD"
  | "CHANGE_CARDS" | "READY_TO_PLAY" | "LEAVE_GAME";

export type Message<T = object> = T & {
  type: MESSAGE_TYPE;
};

export type ABILITY_TYPE = 'WOLF' | 'DROP' | 'SMILE' | 'AXE' | 'BONES' | 'TEETH'; 

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
    [userId: string]: {
      userId: string;
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

export type Player = {
  id: string;
  name: string | null;
   readyToPlay: boolean;
  // monsters: Monster[];
  // cards: CardsType;
};

export type Game = {
  id: string;
  actions: number;
  lastAction: string | null;
  // cardsAvailable: Card[];
  // cardsThrownAway: Card[];
  // userId: string;
  me: Player;
  otherPlayers: Player[];
  activePlayer?: Player;
  // winnerId?: string;
};

// export type User = {
//   id: string;
//   name: string | null;
//   gameId?: string;
 
// };

export type MessageWithGame = Message<{
  game: Game;
  me: Player;
  otherPlayers: Player[];
}>;

export type MessageHandshake = Message<{
  me: Player;
  otherPlayers: Player[];
  game?: Game;
    // ability?: AbilityState;
    // legion?: LegionState;
}>;

export type MessageNameAccepted = Message<{
  me: Player;
  otherPlayers: Player[];
  // ability?: AbilityState;
  // legion?: LegionState;
}>;

