import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import appReducer from '../slices/App';
import networkReducer from '../slices/Network';

export const store = configureStore({
  reducer: {
    app: appReducer,
    network: networkReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
