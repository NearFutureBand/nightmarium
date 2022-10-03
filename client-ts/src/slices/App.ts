import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { getCardIndexInSelection } from '../helpers';
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
  selectedCards: SelectedCard[];
  game: Game | null;
  abilityState: AbilityState | null;
  playerId: string | null;
  draggedCard: null | Card;
  winnerId: string | null;
  awaitingLegion: LegionState | null;
}

const initialState: AppState = {
  selectedCards: [],
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
      const { monsterId, playerId, monsterBodyLength } = action.payload;
      if (
        state.selectedMonster?.monsterId === monsterId &&
        state.selectedMonster?.playerId === playerId
      ) {
        state.selectedMonster = null;
        return;
      }
      state.selectedMonster = { monsterId, playerId, monsterBodyLength };
    },
    deSelectMonster: (state) => {
      state.selectedMonster = null;
    },
    setSelectedCard: (
      state,
      action: PayloadAction<SelectedCard & { shiftPressed: boolean }>
    ) => {
      const {
        monsterId,
        playerId,
        cardId,
        shiftPressed,
        cardBodypart,
        legion,
      } = action.payload;

      const cardIndexIfSelected = getCardIndexInSelection(
        { cardId, monsterId, playerId },
        state.selectedCards
      );
      const isCardAlreadySelected = cardIndexIfSelected >= 0;

      if (
        isCardAlreadySelected &&
        !shiftPressed &&
        state.selectedCards.length === 1
      ) {
        state.selectedCards = [];
      }
      if (
        isCardAlreadySelected &&
        !shiftPressed &&
        state.selectedCards.length > 1
      ) {
        state.selectedCards = [
          { monsterId, cardId, playerId, cardBodypart, legion },
        ];
      }
      if (isCardAlreadySelected && shiftPressed) {
        state.selectedCards.splice(cardIndexIfSelected, 1);
      }
      if (!isCardAlreadySelected && shiftPressed) {
        state.selectedCards.push({
          monsterId,
          cardId,
          playerId,
          cardBodypart,
          legion,
        });
      }
      if (!isCardAlreadySelected && !shiftPressed) {
        state.selectedCards = [
          { monsterId, cardId, playerId, cardBodypart, legion },
        ];
      }
    },
    deSelectCard: (state) => {
      state.selectedCards = [];
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

export const selectAvailableBodyPartsToInstall = (
  state: RootState
): Set<number> => {
  const game = state.app.game!;
  // рассчитываем только в свой ход
  if (game.activePlayer?.id !== state.app.playerId) {
    return new Set<number>();
  }

  const availableBodyparts = new Set<number>();
  game.activePlayer!.monsters.forEach((monster) => {
    availableBodyparts.add(monster.body.length);
  });
  return availableBodyparts;
};

export const selectLastAction = (state: RootState) => {
  return state.app.game!.lastAction;
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
