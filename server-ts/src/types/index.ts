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
  cardsThrowedAway: CardsDatabase; // TODO тоже по-хорошему скрыть
  activePlayer?: PlayerState<number>;
  me?: PlayerState<Card[]>;
  otherPlayers: PlayerState<number>[];
  actions: number;
  abilitiesMode?: AbilitiesMode;
};

export type AbilityDropData = {
  cardId: number;
};

export type AbilitySmileData = {
  cardId: number;
  monsterId: number;
};

export type AbilityAxeData = {
  playerId: string;
  monsterId: number;
};

export type ApplyAbilityParams = {
  abilityNumber: number;
  abilityType: number;
} & AbilityDropData &
  AbilitySmileData &
  AbilityAxeData;
