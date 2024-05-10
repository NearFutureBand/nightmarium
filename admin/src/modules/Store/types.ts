import { Games, Users } from 'src/types';

export type StoreType = {
  games: Games;
  users: Users;
};

export type StoreContextType = {
  store: StoreType;
  setStore: React.Dispatch<React.SetStateAction<StoreType>>;
};
