import { configureStore } from '@reduxjs/toolkit';
import { AppReducer } from './slices';

export const store = configureStore({
  reducer: AppReducer,
  devTools: process.env.NODE_ENV !== 'production',
});