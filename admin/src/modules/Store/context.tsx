import { PropsWithChildren, createContext, useState } from "react";
import { Games, Users } from "src/types";
import { MOCK_STATE } from "./mock";

export type StoreType = {
  games: Games;
  users: Users;
};

export type StoreContextProvider = {
  store: StoreType;
  setStore: React.Dispatch<React.SetStateAction<StoreType>>;
};

const DEFAULT_VALUE: StoreContextProvider = {
  store: {
    games: {},
    users: {},
  },
  setStore: () => {},
};

export const StoreContext = createContext<StoreContextProvider>(DEFAULT_VALUE);

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const [store, setStore] = useState<StoreType>(MOCK_STATE);

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      {children}
    </StoreContext.Provider>
  );
};
