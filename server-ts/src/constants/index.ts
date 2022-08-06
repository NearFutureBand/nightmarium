export enum ABILITIES {
  'WOLF' = 'Волк',
  'DROP' = 'Капля',
  'SMILE' = 'Улыбка',
  'AXE' = 'Топор',
  'BONES' = 'Кости',
  'TEETH' = 'Зубы',
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
}

export const HOST = 'localhost';
export const PORT = 9000;
