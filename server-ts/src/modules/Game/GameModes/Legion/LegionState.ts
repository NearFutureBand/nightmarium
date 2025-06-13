import Player from 'src/modules/Player';
import { LegionPlayerState, Legion, LegionStateSerialized } from './types';
import { Card } from 'src/types';

export default class LegionState {
  private playerId: string;
  private monsterId: number;
  private otherPlayersResponses: { [playerId: string]: LegionPlayerState };
  private currentLegion: Legion;

  constructor({
    playerId,
    monsterId,
    otherPlayers,
    legion
  }: {
    playerId: string;
    monsterId: number;
    otherPlayers: Player[];
    legion: Legion;
  }) {
    this.playerId = playerId;
    this.monsterId = monsterId;
    this.otherPlayersResponses = otherPlayers.reduce((result, player) => {
      const howManyCardsHas = player.howManyCards();
      return {
        ...result,
        [player.id]: {
          playerId: player.id,
          howManyCardsHas,
          respondedCorrectly: howManyCardsHas === 0,
          gaveCards: 0
        }
      };
    }, {} as { [playerId: string]: LegionPlayerState });
    this.currentLegion = legion;
  }

  public serialize = (): LegionStateSerialized => {
    return {
      legion: this.currentLegion,
      players: this.otherPlayersResponses
    };
  };

  public acceptAndCheckPlayerCard = (playerId: string, cards: Card[]) => {
    const playerState = this.otherPlayersResponses[playerId];

    // если у игрока была всего одна карта, то она засчитывается
    if (playerState?.howManyCardsHas === 1) {
      playerState.respondedCorrectly = true;
      playerState.gaveCards = 1;
      return;
    }

    // Одна карта прислана + ожидаем что она подходящего легиона
    if (cards.length === 1 && cards[0].legion === this.currentLegion) {
      playerState.respondedCorrectly = true;
    }

    // Пришла еще одна карта, когда уже была сброшена одна - итого две и ответ засчитан
    if (cards.length === 1 && playerState.gaveCards === 1) {
      playerState.respondedCorrectly = true;
    }

    // Две карты сразу - засчитываем
    if (cards.length === 2) {
      playerState.respondedCorrectly = true;
    }

    playerState.gaveCards = cards.length;
  };

  public areAllPlayersResponded = () => {
    for (const playerId in this.otherPlayersResponses) {
      if (!this.otherPlayersResponses[playerId].respondedCorrectly) return false;
    }
    return true;
  };

  public getCurrentPlayerId = () => {
    return this.playerId;
  };

  public getCurrentMonsterId = () => this.monsterId;
}
