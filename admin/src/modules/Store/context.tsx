import { PropsWithChildren, createContext, useState } from 'react';
import { StoreContextType, StoreType } from './types';

export const StoreContext = createContext<StoreContextType>({} as StoreContextType);

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const [store, setStore] = useState<StoreType>({ games: {}, users: {} });
  return <StoreContext.Provider value={{ store, setStore }}>{children}</StoreContext.Provider>;
};
