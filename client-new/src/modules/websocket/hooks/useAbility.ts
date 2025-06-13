import { useGameData } from './useGameData';

export const useAbility = () => {
  const { abilitiesMode } = useGameData();
  return abilitiesMode;
};
