import { createSlice } from '@reduxjs/toolkit';

import { randomColor } from '../helpers';

const initialState = {
  name: '',
  game: {},
  selectedCardId: [],
  selectedMonsterId: []
}

export const counterSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    selectCard: (state, { payload }) => {
      const { cardId, monsterId, playerId } = payload;
      if (state.selectedCardId[0] === cardId || cardId === null) {
        state.selectedCardId = [];
      } else {
        state.selectedCardId = [cardId, monsterId, playerId];
      }
    },
    selectMonster: (state, { payload }) => {
      const { monsterId, playerId } = payload;
      if (state.selectedMonsterId[0] === monsterId || monsterId === null) {
        state.selectedMonsterId = [];
      } else {
        state.selectedMonsterId = [monsterId, playerId];
      }
    },
  },
});

export const getSelectedMonsterId = state => state.selectedMonsterId;
export const getSelectedCardId = state => state.selectedCardId;

// Action creators are generated for each case reducer function
export const { selectCard, selectMonster } = counterSlice.actions

export default counterSlice.reducer