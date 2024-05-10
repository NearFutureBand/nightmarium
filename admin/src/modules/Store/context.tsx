import { PropsWithChildren, createContext, useState } from 'react';
import { MOCK_STATE } from './mock';
import { StoreContextType, StoreType } from './types';

export const StoreContext = createContext<StoreContextType>({} as StoreContextType);

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const [store, setStore] = useState<StoreType>(MOCK_STATE);
  return <StoreContext.Provider value={{ store, setStore }}>{children}</StoreContext.Provider>;
};
