const { omit } = require("lodash");

const { CARDS } = require("../Cards");

class Monster {
  constructor(id, body = []) {
    this.id = id;
    this.body = body;
    this.abilitiesUsed = false;
  }
}

class Player {
  constructor(id, wsClient = null) {
    this.id = id;
    this.name = null;
    this.wsClient = wsClient;
    this.cards = [];
    this.monsters = new Array(5).fill(0).map((item, i) => new Monster(i));
  }

  setName(name) {
    this.name = name;
  }

  setWsClient(wsClient) {
    this.wsClient = wsClient;
  }

  unsetWsClient() {
    this.wsClient = null;
  }

  sendMessage(type, payload) {
    if (!this.wsClient) {
      return;
    }
    this.wsClient.send(JSON.stringify({ type, ...payload }));
  }

  getPlayer() {
    return omit(this, ["wsClient"]);
  }
}

module.exports = Player;