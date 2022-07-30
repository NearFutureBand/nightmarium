import { MESSAGE_TYPE } from '../constants';

export type Card = {
  id: number;
  ability: number | null;
  legion: string;
  bodypart: number[];
};

export type CardsDatabase = { [id: string]: Card };

export type Message = {
  type: MESSAGE_TYPE;
  playerId: string | null;
};
