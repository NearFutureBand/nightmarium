import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NetworkState {
  host: string;
  port: number;
  isConnected: boolean;
  loading: boolean;
}

const initialState: NetworkState = {
  host: 'localhost',
  port: 9000,
  isConnected: false,
  loading: false,
};

export const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setHost: (state, action: PayloadAction<string>) => {
      state.host = action.payload;
    },
    setPort: (state, action: PayloadAction<number>) => {
      state.port = action.payload;
    },
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setNetworkLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setHost, setPort, setIsConnected, setNetworkLoading } =
  networkSlice.actions;

export default networkSlice.reducer;
