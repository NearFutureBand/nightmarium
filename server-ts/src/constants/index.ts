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

export const GAME_SERVER_HOST: string = process.env.GAME_SERVER_HOST || '0.0.0.0';
export const GAME_SERVER_PORT: number = process.env.GAME_SERVER_PORT
  ? Number(process.env.GAME_SERVER_PORT)
  : 9000;
