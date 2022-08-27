export enum MESSAGE_TYPE {
  HANDSHAKE = 'HANDSHAKE',
  AWAIT_ABILITY = 'AWAIT_ABILITY',
  START = 'START',
  PLAY_CARD = 'PLAY_CARD',
  TAKE_CARD = 'TAKE_CARD',
  SUBMIT_ABILITY = 'SUBMIT_ABILITY',
  CANCEL_ABILITY = 'CANCEL_ABILITY',
}

export enum ABILITY_TYPE {
  WOLF,
  DROP,
  SMILE,
  AXE,
  BONES,
  TEETH,
}

export const BODYPARTS = {
  0: 'Ноги',
  1: 'Туловище',
  2: 'Голова',
};

export const ABILITIES: { [key: number]: string } = {
  0: 'Волк',
  1: 'Капля',
  2: 'Улыбка',
  3: 'Топор',
  4: 'Кости',
  5: 'Зубы',
};

export const ABILITIES_DESCRIPTION: { [key: number]: string } = {
  0: 'Откройте две карты из колоды и выложите их (без ограничения по легиону). Те карты, которые не можете выложить, сбросьте.',
  1: 'Возьмите на руку две карты из колоды',
  2: 'Выложите одну карту с руки без ограничения по легиону',
  3: 'Заберите на руку верхнюю карту любого чужого существа.',
  4: 'Сбросьте любое чужое незавершенное существо',
  5: 'Сбросьте верхнюю карту любого своего существа, кроме этого',
};

export const COLORS = {
  red: '#c54a4a',
  blue: '#4984d7',
  green: '#63d45f',
  orange: '#e29d3d',
};

export const HOST = '192.168.100.5';
export const PORT = 9000;
