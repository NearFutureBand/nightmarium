export type Legion = 'red' | 'orange' | 'blue' | 'green';

export type LegionPlayerState = {
  playerId: string;
  howManyCardsHas: number; // сколько карт у игрока есть ( не может отдать больше этого количества)
  gaveCards: number;
  respondedCorrectly: boolean;
};

export type LegionStateSerialized = {
  legion: Legion;
  players: { [playerId: string]: LegionPlayerState };
};
