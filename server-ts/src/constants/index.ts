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

export const HOST: string = process.env.HOST || '0.0.0.0';
export const PORT: number = process.env.PORT ? Number(process.env.PORT) : 9000;
