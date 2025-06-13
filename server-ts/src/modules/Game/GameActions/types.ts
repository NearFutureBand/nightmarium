import { PrepareNextAbilityResult } from '../GameModes/Abilities/types';

export type PlayCardResult = PrepareNextAbilityResult & {
  error?: string;
  legionMode?: boolean;
  gameOver?: boolean;
  lastAction?: string;
  putCardOnly?: boolean;
  abilitiesMode?: boolean;
};
