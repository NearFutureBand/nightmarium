const { omit } = require("lodash");

const { CARDS } = require("../Cards");

class Game {
  constructor() {
    this.cardsAvailable = omit(CARDS, [8, 11, 25, 30, 31, 60, 47]);
    this.cardsThrowedAway = {};
    this.players = [];
    this.activePlayerIndex = null;
    this.activePlayer = null;
    this.actions = null;
    this.idMap = {};
  }

  addPlayer(player) {
    const playerIndex = this.players.push(player);
    this.idMap[player.id] = playerIndex;
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