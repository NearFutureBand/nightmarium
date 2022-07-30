import { CARDS } from '../Cards';
import { randomInteger } from '../../helpers';
import { Card, CardsDatabase } from '../../types';
import Player from '../Player';

export default class Game {
  private cardsAvailable: CardsDatabase;
  private cardsThrowedAway: CardsDatabase;
  private _players: Player[];
  private activePlayerIndex: number | null;
  private actions: unknown;
  private idMap: { [playerId: string]: number }; // playerId -> index of player in players array

  constructor() {
    this.cardsAvailable = CARDS;
    this.cardsThrowedAway = {};
    this._players = [];
    this.activePlayerIndex = null;
    this.actions = null;
    this.idMap = {};
  }

  giveDefaulCards = (): Card[] => {
    return new Array(6).fill(null).map(() => {
      return this.giveCard();
    });
  };

  giveCard = () => {
    const availableIndices = Object.keys(this.cardsAvailable);
    // if (availableIndices.length === 0) {
    //   return;
    // } // TODO check this case later
    const cardIndex =
      availableIndices[randomInteger(0, availableIndices.length - 1)];
    const card: Card = { ...this.cardsAvailable[cardIndex] };
    delete this.cardsAvailable[cardIndex];
    return card;
  };

  addPlayer = (player: Player) => {
    const playersArrayLength = this._players.push(player);
    this.idMap[player.id] = playersArrayLength - 1;
    console.log(this.idMap);
  };

  public get players() {
    return this._players;
  }

  public getGameState = (requestPlayerId?: string) => {
    console.log('getGameState', requestPlayerId);
    return {
      cardsAvailable: this.cardsAvailable,
      cardsThrowedAway: this.cardsThrowedAway,
      activePlayer: this.getActivePlayer()?.getPlayerState(),
      me: requestPlayerId ? this.getPlayerById(requestPlayerId) : undefined,
      players: this.players.map((player) => player.getPlayerState()),
    };
  };

  setNextActivePlayer() {
    if (!this.activePlayerIndex) {
      this.activePlayerIndex = 0;
    }
    this.activePlayerIndex =
      this.activePlayerIndex === this.players.length - 1
        ? 0
        : this.activePlayerIndex + 1;
    this.actions = 2;
  }

  getActivePlayer = () => {
    if (this.activePlayerIndex !== 0 && !this.activePlayerIndex) return null;
    return this._players[this.activePlayerIndex];
  };

  getPlayerById = (id: string): Player => {
    return this._players[this.idMap[id]];
  };
}
