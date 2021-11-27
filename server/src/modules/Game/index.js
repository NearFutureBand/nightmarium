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

  static giveDefaulCards() {
    // TODO оптимизировать с помощью giveCard
    return new Array(6).fill(null).map(() => {
      const availableIndices = Object.keys(CARDS);
      const cardIndex = availableIndices[randomInteger(0, availableIndices.length - 1)];
      const card = { ...CARDS[cardIndex] };
      delete CARDS[cardIndex];
      return card;
    });
  }

  static giveCard() {
    const availableIndices = Object.keys(CARDS);
    const cardIndex = availableIndices[randomInteger(0, availableIndices.length - 1)];
    const card = { ...CARDS[cardIndex] };
    delete CARDS[cardIndex];
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

  getGame() {
    return {
      ...omit(this, ["activePlayerIndex", "idMap"]),
      activePlayer: this.activePlayer?.getPlayer() || null,
      players: this.players.map(player => player.getPlayer()),
    }
  }

}

module.exports = Game;