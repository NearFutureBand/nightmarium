const { WebSocketServer } = require('ws');

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

const CARDS = {
  8: {
    id: 8,
    ability: 4,
    legion: "blue",
    bodypart: [1],
  },
  11: {
    id: 11,
    ability: 1,
    legion: "blue",
    bodypart: [0, 1],
  },
  25: {
    id: 25,
    ability: 5,
    legion: "blue",
    bodypart: [2],
  },
  30: {
    id: 30,
    ability: null,
    legion: "red",
    bodypart: [0],
  },
  31: {
    id: 31,
    ability: 2,
    legion: "red",
    bodypart: [2],
  },
  47: {
    id: 47,
    ability: 1,
    legion: "red",
    bodypart: [1],
  },
  60: {
    id: 60,
    ability: 2,
    legion: "orange",
    bodypart: [0],
  },
  61: {
    id: 61,
    ability: 1,
    legion: "orange",
    bodypart: [2],
  },
  68: {
    id: 68,
    ability: 0,
    legion: "orange",
    bodypart: [1],
  },
  76: {
    id: 76,
    ability: 0,
    legion: "orange",
    bodypart: [2],
  },
  91: {
    id: 91,
    ability: 5,
    legion: "green",
    bodypart: [2],
  },
  102: {
    id: 102,
    ability: 3,
    legion: "green",
    bodypart: [2],
  }
}

const player1 = {
  name: "Roman",
  cards: Object.values(CARDS).splice(0, 6),
  monsters: [
    {
      body: [CARDS[30], CARDS[47]],
      abilitiesUsed: false
    }, {
      body: [CARDS[60]],
      abilitiesUsed: false
    }
  ],
}

const game = {
  players: [player1],
  activePlayer: player1,
  step: 0,
}

const clients = [];

const wsServer = new WebSocketServer({ host: 'localhost', port: 9000 });
wsServer.addListener('connection', (wsClient) => {
  


  wsClient.send(JSON.stringify({ type: 'ANY', game }));
});