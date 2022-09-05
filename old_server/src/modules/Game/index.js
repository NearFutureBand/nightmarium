const { omit } = require("lodash");

const { CARDS } = require("../Cards");
const { randomInteger } = require("../../helpers");

class Game {
  constructor() {
    this.cardsAvailable = CARDS;
    this.cardsThrowedAway = {};
    this.players = [];
    this.activePlayerIndex = null;
    this.activePlayer = null;
    this.actions = null;
    this.idMap = {};
  }

  giveDefaulCards = () => {
    return new Array(6).fill(null).map(() => {
      return this.giveCard();
    });
  }

  giveCard = () => {
    const availableIndices = Object.keys(this.cardsAvailable);
    if (availableIndices.length === 0) {
      return;
    }
    const cardIndex = availableIndices[randomInteger(0, availableIndices.length - 1)];
    const card = { ...this.cardsAvailable[cardIndex] };
    delete this.cardsAvailable[cardIndex];
    return card;
  }

  addPlayer(player) {
    const playersArrayLength = this.players.push(player);
    this.idMap[player.id] = playersArrayLength - 1;
  }

  setNextActivePlayer() {
    if (!this.activePlayerIndex) {
      this.activePlayerIndex = 0;
    }
    this.activePlayerIndex = this.activePlayerIndex === this.players.length - 1 ? 0 : this.activePlayerIndex + 1;
    this.activePlayer = this.players[this.activePlayerIndex];
    this.actions = 2;
  }

  getPlayerById(id) {
    return this.players[this.idMap[id]];
  }
}

module.exports = Game;