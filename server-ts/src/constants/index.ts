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
}

export const HOST = '192.168.100.5';
//export const HOST = 'localhost';
//export const HOST = undefined;
export const PORT = 9000;
