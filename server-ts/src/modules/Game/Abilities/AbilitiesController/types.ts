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
