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
  START = 'START',
  TAKE_CARD = 'TAKE_CARD',
  PLAY_CARD = 'PLAY_CARD',
  AWAIT_ABILITY = 'AWAIT_ABILITY',
  SUBMIT_ABILITY = 'SUBMIT_ABILITY',
  CANCEL_ABILITY = 'CANCEL_ABILITY',
}

export const HOST = '192.168.100.5';
export const PORT = 9000;
