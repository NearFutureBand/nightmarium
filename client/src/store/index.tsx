import { configureStore } from "@reduxjs/toolkit";
import appReducer from "src/slices/App";
import networkReducer from "src/slices/Network";

export const store = configureStore({
  reducer: {
    app: appReducer,
    network: networkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
