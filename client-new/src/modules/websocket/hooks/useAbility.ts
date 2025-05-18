import { useWebsocket } from '..';

export const useAbility = () => {
  const { ability } = useWebsocket();
  return ability;
};
