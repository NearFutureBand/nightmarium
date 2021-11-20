const { WebSocketServer } = require('ws');
const _ = require('lodash');

const { CARDS } = require("./src/modules/Cards");
const Game = require("./src/modules/Game");
const Player = require("./src/modules/Player");

const randomInteger = (min, max) => {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.abs(Math.round(rand));
};

const ABILITIES = {
  0: "Волк",
  1: "Капля",
  2: "Улыбка",
  3: "Топор",
  4: "Кости",
  5: "Зубы"
}

const BODYPARTS = {
  0: "Ноги",
  1: "Туловище",
  2: "Голова"
}

const player1 = new Player("Roman");

const game = new Game();

const wsServer = new WebSocketServer({ host: 'localhost', port: 9000 });
wsServer.on('connection', (wsClient) => {

  const id = Math.random();
  console.log(`new client is connected ${id}`);

  const newPlayer = new Player(id, wsClient);
  game.addPlayer(newPlayer);
  newPlayer.sendMessage("CONNECTION", { playerId: id, game: game.getGame() });

  wsClient.on("message", (event) => {
    const message = JSON.parse(event);

    if (message.type === "RECONNECT") {
      // FE sends id from localstorage
      // set wsClient to the player with given id
    }

    if (message.type === "REGISTRATION") {
      // message: {id, name}
      // setName
    }

    if (message.type === "START") {
      game.setNextActivePlayer();
    }

    if (message.type === "TAKE_CARD") {
      const availableCards = Object.values(game.cardsAvailable);
      if (availableCards.length === 0) {
        return;
      }
      const newCardIndex = randomInteger(0, availableCards.length - 1);
      const newCard = availableCards[newCardIndex];
      delete game.cardsAvailable[newCard.id];
      game.activePlayer.cards.push(newCard);
      game.actions -= 1;

      if (game.actions === 0) {
        game.setNextActivePlayer();
      }
    }

    if (message.type === "PLAY_CARD") {
      const targetMonster = game.activePlayer.monsters[message.monsterId];
      const cardIndex = game.activePlayer.cards.findIndex(card => card.id === message.cardId);
      const card = game.activePlayer.cards[cardIndex];

      const possibleToInstall = card.bodypart.some(bodypartIndex => bodypartIndex === targetMonster.body.length);

      if (!possibleToInstall) {
        return;
      }
      
      game.activePlayer.cards.splice(cardIndex, 1);
      targetMonster.body.push(card);
      game.actions -= 1;

      // monster is ready

      if (game.actions === 0) {
        game.setNextActivePlayer();
      }
    }

    game.players.forEach(player => {
      player.sendMessage(message.type, { game: game.getGame() });
    });
  });

  wsClient.on("close", () => {
    console.log(`${id} disconnected`);
    // const disconnectedPlayer = game.getPlayerById(id);
    // disconnectedPlayer.unsetWsClient();
  });
});