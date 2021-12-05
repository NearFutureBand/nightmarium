const { omit } = require("lodash");

const Monster = require('../Monster');
const { CARDS } = require("../Cards");
const Game = require("../Game");


class Player {
  constructor(id) {
    this.id = id;
    this.name = null;
    this.cards = Game.giveDefaulCards();
    this.monsters = new Array(5).fill(0).map((item, i) => new Monster(i));
  }

  setName(name) {
    this.name = name;
  }

  sendMessage(type, payload) {
    // if (!this.wsClient) {
    //   return;
    // }
    //this.wsClient.send(JSON.stringify({ type, ...payload }));
  }

}

module.exports = Player;