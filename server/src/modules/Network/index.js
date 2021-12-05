const { WebSocketServer } = require('ws');
const { HOST, PORT } = require('../../constants');
const Game = require('../Game');
const Player = require('../Player');

class Network {
  
  constructor() {
    this.host = HOST || 'localhost';
    this.port = PORT || 9000;
    this.wsServer = null;
    this.game = null;
    this.clientsMap = {};
  }

  addClient = (id, wsClient) => {
    this.clientsMap[id] = wsClient;
  } 

  launchServer = () => {
    if (!this.wsServer) {
      this.wsServer = new WebSocketServer({ host: this.host, port: this.port });
      this.wsServer.on('connection', this.onConnection);
      this.game = new Game();
    }
  }

  onConnection = (wsClient) => {
    const id = Math.random();
    console.log(`new client is connected ${id}`);

    this.addClient(id, wsClient);
    this.game.addPlayer(new Player(id));
    this.sendMessage(wsClient, "CONNECTION", { playerId: id, game: this.game });
  }

  onMessage = (event, wsClient) => {

  }

  onClose = (wsClient) => {
    //console.log(`client ${} disconnected`);
  }

  sendMessage = (wsClient, type, payload) => {
    wsClient.send(JSON.stringify({ type, ...payload }));
  }

  broadcast = (type, payload) => {
    this.game.players.forEach(player => {
      this.sendMessage(this.clientsMap[player.id], type, payload);
    });
  }
  
}

module.exports = Network;