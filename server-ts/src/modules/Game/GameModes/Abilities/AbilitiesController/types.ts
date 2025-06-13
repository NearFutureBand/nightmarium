import { PlayCardResult } from 'src/modules/Game/GameActions/types';

export type AbilityWolfData = {
  cardIds: number[];
  monsterId?: number;
};

export type AbilityDropData = {};

export type AbilitySmileData = {
  cardId: number;
  monsterId: number;
};

export type AbilityAxeData = {
  targetPlayerId: string;
  targetMonsterId: number;
};

export type AbilityBonesData = {
  targetMonsterId: number;
  targetPlayerId: string;
};

export type AbilityTeethData = {
  targetMonsterId: number;
};

export type ApplyAbilityParams = {
  abilityNumber: number;
  abilityType: number;
} & AbilityWolfData &
  AbilityDropData &
  AbilitySmileData &
  AbilityAxeData &
  AbilityBonesData &
  AbilityTeethData;

export type ApplyAbilityHandler<T = {}> = (params: T) => PlayCardResult;
