

const Monster = require('../Monster');
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

  addCard = (card) => {
    this.cards.push(card);
  }

  getCardIndexById = (cardId) => {
    return this.cards.findIndex(card => card.id === cardId);
  }

  placeCardToMonster = (cardId, monsterId) => {
    const targetMonster = this.monsters[monsterId];
    const cardIndex = this.getCardIndexById(cardId);
    const card = this.cards[cardIndex];

    const possibleToInstall = card.bodypart.some(bodypartIndex => bodypartIndex === targetMonster.body.length);

    if (!possibleToInstall) {
      return;
    }

    this.cards.splice(cardIndex, 1);
    targetMonster.body.push(card);
  }
}

module.exports = Player;