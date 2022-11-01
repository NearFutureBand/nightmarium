import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { getCardIndexInSelection } from '../helpers';
import { AbilityState, Card, Game, LegionState, SelectedCard, SelectedMonster, User } from '../types';

export interface AppState {
  selectedMonster: SelectedMonster | null;
  selectedCards: SelectedCard[];
  game: Game | null;
  abilityState: AbilityState | null;
  me?: User;
  otherPlayers: User[];
  draggedCard: null | Card;
  awaitingLegion: LegionState | null;
  settings: {
    language: string;
    myCardsPosition: 'left' | 'bottom';
    background: string;
  };
}

const initialState: AppState = {
  selectedCards: [],
  selectedMonster: null,
  game: null,
  abilityState: null,
  me: undefined,
  otherPlayers: [],
  draggedCard: null,
  awaitingLegion: null,
  settings: {
    language: 'ru',
    myCardsPosition: 'bottom',
    background: '',
  },
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSelectedMonster: (state, action: PayloadAction<SelectedMonster>) => {
      const { monsterId, playerId, monsterBodyLength } = action.payload;
      if (state.selectedMonster?.monsterId === monsterId && state.selectedMonster?.playerId === playerId) {
        state.selectedMonster = null;
        return;
      }
      state.selectedMonster = { monsterId, playerId, monsterBodyLength };
    },
    deSelectMonster: (state) => {
      state.selectedMonster = null;
    },
    setSelectedCard: (state, action: PayloadAction<SelectedCard & { shiftPressed: boolean }>) => {
      const { monsterId, playerId, cardId, shiftPressed, cardBodypart, legion } = action.payload;

      const cardIndexIfSelected = getCardIndexInSelection({ cardId, monsterId, playerId }, state.selectedCards);
      const isCardAlreadySelected = cardIndexIfSelected >= 0;

      if (isCardAlreadySelected && !shiftPressed && state.selectedCards.length === 1) {
        state.selectedCards = [];
      }
      if (isCardAlreadySelected && !shiftPressed && state.selectedCards.length > 1) {
        state.selectedCards = [{ monsterId, cardId, playerId, cardBodypart, legion }];
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
        state.selectedCards = [{ monsterId, cardId, playerId, cardBodypart, legion }];
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
    setMe: (state, action: PayloadAction<User | undefined>) => {
      state.me = action.payload;
    },
    setOtherPlayers: (state, action: PayloadAction<User[]>) => {
      state.otherPlayers = action.payload;
    },
    setDraggedCard: (state, action: PayloadAction<Card | null>) => {
      state.draggedCard = action.payload;
    },
    setAwaitingLegion: (state, action: PayloadAction<LegionState | null>) => {
      state.awaitingLegion = action.payload;
    },
  },
});

export const selectPlayerId = (state: RootState) => {
  return state.app.me?.id;
};

export const selectIsActive = (playerId?: string) => (state: RootState) => {
  const game = state.app.game;
  return playerId === game?.activePlayer?.id;
};

export const selectAvailableBodyPartsToInstall = (state: RootState): Set<number> => {
  const game = state.app.game!;
  // рассчитываем только в свой ход
  if (game.activePlayer?.id !== state.app.me?.id) {
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

export const selectAmIReadyToPlay = (state: RootState) => {
  return Boolean(state.app.me?.readyToPlay);
};

export const selectHowManyReadyToPlay = (state: RootState) => {
  const iAmReadyToPlay = selectAmIReadyToPlay(state);
  // TODO тут для расчета готовых играть- готов играть если readyToPlay === true и gameId существует
  return state.app.otherPlayers.reduce((count, player) => (player.readyToPlay ? count + 1 : count), 0) + (iAmReadyToPlay ? 1 : 0);
};

export const selectGameId = (state: RootState) => {
  return state.app.game?.id;
};

export const {
  setSelectedMonster,
  deSelectMonster,
  setSelectedCard,
  deSelectCard,
  setGame,
  setAbilityState,
  setMe,
  setOtherPlayers,
  setDraggedCard,
  setAwaitingLegion,
} = appSlice.actions;

export default appSlice.reducer;
