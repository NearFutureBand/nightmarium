import { WebSocketServer, WebSocket } from 'ws';
import { HOST, PORT, MESSAGE_TYPE } from '../constants';
import { generateCryptoId } from '../helpers';
import { Message } from '../types';
import Game from './Game';
import Player from './Player';

export default class Network {
  private host: string;
  private port: number;
  private wsServer: WebSocketServer | null;
  private game: Game | null;
  private clientsMap: { [clientId: string]: WebSocket }; // clientId -> wsClient
  private playersMap: { [playerId: string]: string }; // playerId -> clientId
  private messageActionsMap: {
    [messageType: string]: (
      message: Message,
      clientId: string
    ) => boolean | void;
  };

  constructor() {
    this.host = HOST || 'localhost';
    this.port = PORT || 9000;
    this.wsServer = null;
    this.game = null;
    this.clientsMap = {};
    this.playersMap = {};
    this.messageActionsMap = {
      [MESSAGE_TYPE.HANDSHAKE]: this.onHandshake,
      [MESSAGE_TYPE.START]: this.onStart,
      [MESSAGE_TYPE.TAKE_CARD]: this.onTakeCard,
      [MESSAGE_TYPE.PLAY_CARD]: this.onPlayCard,
    };
  }

  addClient = (clientId: string, wsClient: WebSocket) => {
    this.clientsMap[clientId] = wsClient;
  };

  launchServer = () => {
    if (!this.wsServer) {
      this.wsServer = new WebSocketServer({ host: this.host, port: this.port });
      this.wsServer.on('connection', this.onConnection);
      this.game = new Game();
    }
  };

  onConnection = (wsClient: WebSocket) => {
    const clientId = Math.random().toString();
    console.log(`new client is connected ${clientId}`);
    this.addClient(clientId, wsClient);

    wsClient.on('message', (event) => this.onMessage(event, clientId)); // TODO find out event type
    wsClient.on('close', () => this.onClose(clientId));
  };

  onMessage = (event: any, clientId: string) => {
    const message: Message = JSON.parse(event);
    console.log('\n');
    console.log('==>', clientId, message);

    try {
      const doNotBroadcast = this.messageActionsMap[message.type](
        message,
        clientId
      );
      if (!doNotBroadcast) {
        this.broadcast(message.type);
      }
    } catch (error) {
      console.log(error);
    }
  };

  onClose = (clientId: string) => {
    console.log(`${clientId} disconnected`);
    delete this.clientsMap[clientId];
    // TODO broadcast ?
    this.displayClientsMap();
    this.displayPlayersMap();
  };

  sendMessage = (clientId: string, type: MESSAGE_TYPE, payload: any) => {
    // TODO payload: any ?
    const wsClient = this.clientsMap[clientId];
    if (!wsClient) return;
    console.log('<==', type);
    console.log('\n');
    wsClient.send(JSON.stringify({ type, ...payload }));
    this.displayClientsMap();
    this.displayPlayersMap();
  };

  broadcast = (type: MESSAGE_TYPE, payload?: any) => {
    // TODO maybe change to loop by players
    this.game!.players.forEach((player) => {
      this.sendMessage(this.playersMap[player.id], type, {
        ...payload,
        game: this.game!.getGameState(player.id),
      });
    });
  };

  onHandshake = (message: Message<{ playerId: string }>, clientId: string) => {
    let playerId = message.playerId;

    if (playerId && playerId in this.playersMap) {
      this.playersMap[playerId] = clientId;
    } else {
      playerId = generateCryptoId();
      this.game!.addPlayer(new Player(playerId, this.game!.giveDefaulCards()));
      this.playersMap[playerId] = clientId;
    }

    this.sendMessage(clientId, MESSAGE_TYPE.HANDSHAKE, {
      playerId,
      game: this.game!.getGameState(playerId),
    });
    return true;
  };

  onStart = () => {
    this.game!.setNextActivePlayer();
  };

  onTakeCard = () => {
    this.game!.activePlayerTakesCard();
  };

  onPlayCard = (message: Message<{ cardId: number; monsterId: number }>) => {
    try {
      this.game!.activePlayerPutsCard(message.cardId, message.monsterId);
    } catch (error) {
      console.log(error);
      return true;
    }
  };

  getPlayerIdByClientId = (clientId: string) => {
    for (const playerId in this.playersMap) {
      if (clientId === this.playersMap[playerId]) return playerId;
    }
  };

  displayClientsMap = () => {
    console.log('CLIENT_ID           |   WEBSOCKET ');
    for (const clientId in this.clientsMap) {
      console.log(`${clientId}     ${Boolean(this.clientsMap[clientId])}`);
    }
    console.log('----------------------------------\n');
  };

  displayPlayersMap = () => {
    console.log('PLAYER_ID                         |  CLIENT_ID ');
    for (const playerId in this.playersMap) {
      console.log(`${playerId}    ${this.playersMap[playerId]}`);
    }
    console.log('----------------------------------\n');
  };
}

class GameController extends Network {}

module.exports = Network;
