import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import {
  AbilityState,
  Card,
  Game,
  LegionState,
  SelectedCard,
  SelectedMonster,
} from '../types';

export interface AppState {
  selectedMonster: SelectedMonster | null;
  selectedCard: SelectedCard | null;
  game: Game | null;
  abilityState: AbilityState | null;
  playerId: string | null;
  draggedCard: null | Card;
  winnerId: string | null;
  awaitingLegion: LegionState | null;
}

const initialState: AppState = {
  selectedCard: null,
  selectedMonster: null,
  game: null,
  abilityState: null,
  playerId: null,
  draggedCard: null,
  winnerId: null,
  awaitingLegion: null,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedMonster: (state, action: PayloadAction<SelectedMonster>) => {
      const { monsterId, playerId } = action.payload;
      if (
        state.selectedMonster?.monsterId === monsterId &&
        state.selectedMonster?.playerId === playerId
      ) {
        state.selectedMonster = null;
        return;
      }
      state.selectedMonster = { monsterId, playerId };
    },
    deSelectMonster: (state) => {
      state.selectedMonster = null;
    },
    setSelectedCard: (state, action: PayloadAction<SelectedCard>) => {
      const { monsterId, playerId, cardId } = action.payload;
      if (
        state.selectedCard?.monsterId === monsterId &&
        state.selectedCard?.cardId === cardId &&
        state.selectedCard?.playerId === playerId
      ) {
        state.selectedCard = null;
        return;
      }
      state.selectedCard = { monsterId, cardId, playerId };
    },
    deSelectCard: (state) => {
      state.selectedCard = null;
    },
    setGame: (state, action: PayloadAction<Game>) => {
      state.game = action.payload;
    },
    setAbilityState: (state, action: PayloadAction<AbilityState | null>) => {
      state.abilityState = action.payload;
    },
    setPlayerId: (state, action: PayloadAction<string | null>) => {
      state.playerId = action.payload;
    },
    setDraggedCard: (state, action: PayloadAction<Card | null>) => {
      state.draggedCard = action.payload;
    },
    setWinner: (state, action: PayloadAction<string | null>) => {
      state.winnerId = action.payload;
    },
    setAwaitingLegion: (state, action: PayloadAction<LegionState | null>) => {
      state.awaitingLegion = action.payload;
    },
  },
});

export const selectIsActive = (playerId?: string) => (state: RootState) => {
  const game = state.app.game;
  return playerId === game?.activePlayer?.id;
};

export const {
  setSelectedMonster,
  deSelectMonster,
  setSelectedCard,
  deSelectCard,
  setGame,
  setAbilityState,
  setPlayerId,
  setDraggedCard,
  setWinner,
  setAwaitingLegion,
} = appSlice.actions;

export default appSlice.reducer;
