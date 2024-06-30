export enum MESSAGE_TYPE {
  HANDSHAKE = 'HANDSHAKE',
  PLAYER_CONNECTED = 'PLAYER_CONNECTED',
  AWAIT_ABILITY = 'AWAIT_ABILITY',
  START = 'START',
  PLAY_CARD = 'PLAY_CARD',
  TAKE_CARD = 'TAKE_CARD',
  SUBMIT_ABILITY = 'SUBMIT_ABILITY',
  CANCEL_ABILITY = 'CANCEL_ABILITY',
  GAME_OVER = 'GAME_OVER',
  SET_NAME = 'SET_NAME',
  NAME_ACCEPTED = 'NAME_ACCEPTED',
  AWAIT_LEGION_CARD = 'AWAIT_LEGION_CARD',
  THROW_LEGION_CARD = 'THROW_LEGION_CARD',
  CHANGE_CARDS = 'CHANGE_CARDS',
  READY_TO_PLAY = 'READY_TO_PLAY',
  LEAVE_GAME = 'LEAVE_GAME',
  ADMIN_HANDSHAKE = 'ADMIN_HANDSHAKE',
  ADMIN_RESORT_CARDS = 'ADMIN_RESORT_CARDS',
}

export type Message<T = object> = T & {
  type: MESSAGE_TYPE;
};

export type Legion = 'red' | 'orange' | 'blue' | 'green';

export type Card = {
  id: number;
  ability: number | null;
  legion: Legion;
  bodypart: number[];
};

export type LegionPlayerState = {
  playerId: string;
  howManyCardsHas: number; // сколько карт у игрока есть ( не может отдать больше этого количества)
  gaveCards: number;
  respondedCorrectly: boolean;
};

export type AbilityState = {
  type: number | null;
  index: number; // Индекс способности в монстре ( 0 - 3 )
  done: boolean; // Выполнена способность или нет - в целом пока бесполезно
  inprogress: boolean;
  actions: number; // Сколько действий осталось внутри этой способности, нужно для сложных сп. таких как Волк
  cards?: Card[]; // Карты, выдаваемые внутри способности. Будут храниться здесь, чтобы оперировать только индексами карт
};

export type Game = {
  id: string;
  cardsAvailable: CardsAvailable;
  cardsThrownAway: CardsThrownAway;
  _players: Player[];
  activePlayerIndex: number;
  actions: number;
  lastAction: string | null;
  idMap: IdMap;
  abilitiesMode: {
    playerId: string;
    monsterId: number;
    sequence: (number | null)[];
    currentAbilityState: AbilityState;
    giveCard: () => Card;
    stopAbilitiesMode: () => void;
    applyAbilityMap: unknown | null;
  } | null;
  legionMode: {
    playerId: string;
    monsterId: number;
    otherPlayersResponses: { [playerId: string]: LegionPlayerState }; // Здесь должны быть остальные игроки
    currentLegion: Legion;
  } | null;
  monstersToWin: number;
  applyAbilityMap: unknown | null;
};
export type Games = Record<string, Game>;

export type CardsAvailable = Card[];

export type CardsThrownAway = Card[];

export type Player = {
  _id: string;
  name: string;
  cards: Card[];
  monsters: Monster[];
};

export type Monster = {
  id: number;
  body: Card[];
  abilitiesUsed: boolean;
};

export type IdMap = Record<string, number>;

export type Users = Record<string, User>;

export type User = {
  id: string;
  name: string;
  gameId: string;
  readyToPlay: boolean;
};
