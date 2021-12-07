const { WebSocketServer } = require('ws');
const { HOST, PORT, MESSAGE_TYPE } = require('../../constants');
const Game = require('../Game');
const Player = require('../Player');

class Network {
  
  constructor() {
    this.host = HOST || 'localhost';
    this.port = PORT || 9000;
    this.wsServer = null;
    this.game = null;
    this.clientsMap = {}; // clientId -> wsClient
    this.playersMap = {}; // playerId -> clientId
    this.messageActionsMap = {
      [MESSAGE_TYPE.HANDSHAKE]: this.onHandshake,
      [MESSAGE_TYPE.START]: this.onStart,
      [MESSAGE_TYPE.TAKE_CARD]: this.onTakeCard,
      [MESSAGE_TYPE.PLAY_CARD]: this.onPlayCard,
    };
  }

  addClient = (clientId, wsClient) => {
    this.clientsMap[clientId] = wsClient;
  } 

  launchServer = () => {
    if (!this.wsServer) {
      this.wsServer = new WebSocketServer({ host: this.host, port: this.port });
      this.wsServer.on('connection', this.onConnection);
      this.game = new Game();
    }
  }

  onConnection = (wsClient) => {
    const clientId = Math.random();
    console.log(`new client is connected ${clientId}`);
    this.addClient(clientId, wsClient);

    wsClient.on("message", (event) => this.onMessage(event, clientId));
    wsClient.on("close", () => this.onClose(clientId));
  }

  onMessage = (event, clientId) => {
    const message = JSON.parse(event);
    console.log("message", message);

    const noBroadcast = this.messageActionsMap[message.type](message, clientId);
    if (!noBroadcast) {
      this.broadcast(message.type, { game: this.game });
    }
  }

  onClose = (clientId) => {
    console.log(`${clientId} disconnected`);
    delete this.clientsMap[clientId];
  }

  sendMessage = (clientId, type, payload) => {
    const wsClient = this.clientsMap[clientId];
    if (wsClient) {
      wsClient.send(JSON.stringify({ type, ...payload }));
    }
  }

  broadcast = (type, payload) => {
    this.game.players.forEach(player => {
      this.sendMessage(this.playersMap[player.id], type, payload);
    });
  }

  onHandshake = (message, clientId) => {
    let playerId = message.playerId;
    if (playerId && playerId in this.playersMap) {
      this.playersMap[playerId] = clientId;
    } else {
      playerId = Math.random();
      this.game.addPlayer(new Player(playerId));
      this.playersMap[playerId] = clientId;
    }
    this.sendMessage(clientId, MESSAGE_TYPE.HANDSHAKE, { playerId, game: this.game });
    return true;
  }

  onStart = () => {
    this.game.setNextActivePlayer();
  }

  onTakeCard = () => {
    this.game.activePlayer.addCard(this.game.giveCard());
    game.actions -= 1;

    if (this.game.actions === 0) {
      this.game.setNextActivePlayer();
    }
  }

  onPlayCard = () => {
    this.game.activePlayer.placeCardToMonster(message.cardId, message.monsterId);
    game.actions -= 1;

    // if (targetMonster.body.length === 3) {
    //   // monster has been built
    //   console.log(targetMonster.body);
    //   abilitiesState.playerId = game.activePlayer.id;
    //   abilitiesState.monsterId = targetMonster.id;
    //   abilitiesState.abilities = [...targetMonster.body].reverse().map((bodypart, index) => ({ type: bodypart.ability, done: false, inprogress: false }));
    //   abilitiesState.currentAbilityIndex = 0;
    //   onAbility();
    //   return;
    // }

    if (this.game.actions === 0) {
      this.game.setNextActivePlayer();
    }
  }

  displayClientsMap = () => {
    console.log("clients map: ");
    for (const clientId in this.clientsMap) {
      console.log(clientId, Boolean(this.clientsMap[clientId]));
    }
  }

  displayPlayersMap = () => {
    console.log("players map: ");
    for (const playerId in this.playersMap) {
      console.log(playerId, this.playersMap[playerId]);
    }
  }
  
}

module.exports = Network;