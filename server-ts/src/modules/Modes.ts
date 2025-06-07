import { ABILITIES } from '../constants';
import { MESSAGE_TYPE } from '../shared/types';
import {
  AbilityMessagePayload,
  AbiltityMessageOrUndefined,
  ApplyAbilityParams,
  Card,
  Legion,
  LegionMessagePayload,
  LegionPlayerState,
  Message,
  PutCardReturnType
} from '../types';
import Monster from './Monster';
import Player from './Player';

export class LegionMode {
  playerId: string;
  monsterId: number;
  otherPlayersResponses: { [playerId: string]: LegionPlayerState }; // Здесь должны быть остальные игроки
  currentLegion: Legion;

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

  getLegionModeState = (): LegionMessagePayload => {
    return {
      legion: this.currentLegion,
      players: this.otherPlayersResponses
    };
  };

  acceptAndCheckPlayerCard = (playerId: string, cards: Card[]) => {
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

  areAllPlayersResponded = () => {
    for (const playerId in this.otherPlayersResponses) {
      if (!this.otherPlayersResponses[playerId].respondedCorrectly) return false;
    }
    return true;
  };
}
