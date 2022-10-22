import { Legion } from '../types';

export enum ABILITIES {
  'WOLF',
  'DROP',
  'SMILE',
  'AXE',
  'BONES',
  'TEETH',
}

export enum BODYPARTS {
  'LEGS' = 'Ноги',
  'TORSO' = 'Туловище',
  'HEAD' = 'Голова',
}

export const GAME_ACTIONS = {
  PLAY_CARD: (legion: Legion) => `PLAY_CARD:${legion}`,
  CHANGE_CARDS: 'CHANGE_CARDS',
  TAKE_CARD: 'TAKE_CARD',
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

export const HOST = '192.168.100.5';
// export const HOST = '192.168.0.103';
//export const HOST = 'localhost';
//export const HOST = undefined;
export const PORT = 9000;
