import { MESSAGE_TYPE } from '../constants';
import Monster from '../modules/Monster';

export type Legion = 'red' | 'orange' | 'blue' | 'green';

export type Card = {
  id: number;
  ability: number | null;
  legion: Legion;
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

export type AbilityMessagePayload = {
  cards?: Card[];
  abilityNumber: number;
  abilityType: number;
  actions: number;
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

export type AbiltityMessageOrUndefined =
  | Message<{
      ability: AbilityMessagePayload;
    }>
  | undefined;

export type PutCardReturnType =
  | Message<{ winner: string }>
  | Message<{ legion: LegionMessagePayload }>
  | Message<{
      ability: AbilityMessagePayload;
    }>
  | undefined;

export type ApplyAbilityHandler<T = {}> = (
  params: T
) => PutCardReturnType | void;
