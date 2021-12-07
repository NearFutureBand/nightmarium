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

    const goOn = this.messageActionsMap[message.type](message, clientId);
    if (goOn) {
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
      this.sendMessage(player.id, type, payload);
    });
  }

  onHandshake = (message, clientId) => {
    let playerId = message.playerId;
    console.log(playerId in this.playersMap);
    if (playerId && playerId in this.playersMap) {
      this.playersMap[playerId] = clientId;
    } else {
      playerId = Math.random();
      this.game.addPlayer(new Player(playerId));
      this.playersMap[playerId] = clientId;
    }
    this.sendMessage(clientId, MESSAGE_TYPE.HANDSHAKE, { playerId, game: this.game });
    return false;
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