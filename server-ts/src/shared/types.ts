export type Legion = 'red' | 'orange' | 'blue' | 'green';

export type Card = {
  id: number;
  ability: number | null;
  legion: Legion;
  bodypart: number[];
};

export enum MESSAGE_TYPE {
  HANDSHAKE = 'HANDSHAKE',
  PLAYER_CONNECTED = 'PLAYER_CONNECTED',
  START = 'START',
  TAKE_CARD = 'TAKE_CARD',
  PLAY_CARD = 'PLAY_CARD',
  AWAIT_ABILITY = 'AWAIT_ABILITY',
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
}
