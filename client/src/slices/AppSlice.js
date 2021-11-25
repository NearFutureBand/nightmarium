import { createSlice } from '@reduxjs/toolkit';

import { randomColor } from '../helpers';

const initialState = {
  name: '',
  game: {},
  selectedCardId: null,
  selectedMonsterId: null
}

export const counterSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    selectCard: (state, { payload }) => {
      console.log(payload);
      const { cardId } = payload;
      if (state.selectedCardId === cardId || cardId === null) {
        state.selectedCardId = null;
      } else {
        state.selectedCardId = cardId;
      }
    },
    selectMonster: (state, { payload }) => {
      const { monsterId } = payload;
      if (state.selectedMonsterId === monsterId || monsterId === null) {
        state.selectedMonsterId = null;
      } else {
        state.selectedMonsterId = monsterId;
      }
    },
  },
});

export const getSelectedMonsterId = state => state.selectedMonsterId;
export const getSelectedCardId = state => state.selectedCardId;

// Action creators are generated for each case reducer function
export const { selectCard, selectMonster } = counterSlice.actions

export default counterSlice.reducer