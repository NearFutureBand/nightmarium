import { useContext } from "react";
import { StoreContext, StoreContextProvider } from "./context";

export const useStore = () => useContext<StoreContextProvider>(StoreContext);
