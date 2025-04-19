import { WebSocketServer, WebSocket, RawData } from 'ws';
import { GAME_SERVER_HOST, GAME_SERVER_PORT } from '../../constants';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import GameController from '../GameController';
import { Message } from '../../types';
import { Logger } from '../Logger';

export default class Network {
  private host: string;
  private port: number;
  private wsServer: WebSocketServer | null;
  private clientsMap: { [clientId: string]: WebSocket }; // clientId -> wsClient
  private gameController: GameController;

  constructor() {
    this.host = GAME_SERVER_HOST;
    this.port = GAME_SERVER_PORT;
    this.wsServer = null;
    this.clientsMap = {};
    this.gameController = new GameController();
  }

  launchWssServer = () => {
    if (!this.wsServer) {
      const server = createServer({
        cert: readFileSync('/Users/pavelbelyakov/Github/nightmarium/server-ts/src/modules/Network/cert.pem'),
        key: readFileSync('/Users/pavelbelyakov/Github/nightmarium/server-ts/src/modules/Network/key.pem'),
      }, (req, res) => {
        if (this.wsServer) {
          this.wsServer.handleUpgrade(req, req.socket, Buffer.alloc(0), this.onConnection);
        }
      });
      this.wsServer = new WebSocketServer({ server });
      this.wsServer.on('connection', this.onConnection);
      server.listen({ port: this.port, host: this.host }, () => {
        console.log(' ======= Server started ====== ');
      });
      server.on('upgrade', (req, socket, head) => {
        console.log('upgrade', req, socket, head);
      })
    }
  }
  launchServer = () => {
    if (!this.wsServer) {
      this.wsServer = new WebSocketServer({ port: this.port, host: this.host });
      this.wsServer.on('connection', this.onConnection);
      Logger.log(' ======= Server started ====== ', { host: this.host, port: this.port });
    }
  };

  // event handlers
  private onConnection = (wsClient: WebSocket) => {
    const clientId = Math.random().toString();
    Logger.log('Client connected', { clientId });
    this.addClient(clientId, wsClient);
    wsClient.on('message', (event) => this.onMessage(event, clientId));
    wsClient.on('close', () => this.onClose(clientId));
  };
  private onMessage = (event: RawData, clientId: string) => {
    const message: Message = JSON.parse(event.toString());
    Logger.log('==> Message', message);

    try {
      const gameResponse = this.gameController.processGameMessage(clientId, message);
      if (gameResponse.toAdmin && this.gameController.adminClientId) {
        this.sendMessage(this.gameController.adminClientId, gameResponse.toAdmin);
      }
      if (gameResponse.toSenderOnly) {
        this.sendMessage(clientId, gameResponse.toSenderOnly);
      }
      if (gameResponse.broadcast) {
        this.broadcast(gameResponse.broadcast);
      }
      if (gameResponse.toAllExceptSender) {
        this.broadcastExceptOne(gameResponse.toAllExceptSender, clientId);
      }
    } catch (error) {
      Logger.log('Message controller error', error);
    }
  };
  private onClose = (clientId: string) => {
    Logger.log('Client disconnected', clientId);
    delete this.clientsMap[clientId];
  };

  // Send message methods
  private sendMessage = <T>(clientId: string, message: Message<T>) => {
    const wsClient = this.clientsMap[clientId];
    if (!wsClient) return;
    Logger.log('<== Send message', message);
    wsClient.send(JSON.stringify(message));
  };
  private broadcast = (message: Message) => {
    Logger.log('<== Broadcast', message);
    Object.values(this.gameController.getPlayers()).forEach((player) => {
      const playersGame = this.gameController.getGameById(player.gameId);
      this.sendMessage(this.gameController.playerClientMap[player.id], {
        ...message,
        me: this.gameController.getPlayerById(player.id),
        otherPlayers: this.gameController.getOtherUsers(player.id),
        game: playersGame?.getGameState(player.id),
      });
    });
  };
  private broadcastExceptOne = (message: Message, exceptClientId: string) => {
    Logger.log('<== Broadcast except one', message);
    Object.values(this.gameController.getPlayers()).forEach((player) => {
      const clientId = this.gameController.playerClientMap[player.id];
      if (clientId !== exceptClientId) {
        const usersGame = this.gameController.getGameById(player.gameId);
        this.sendMessage(clientId, {
          ...message,
          me: this.gameController.getPlayerById(player.id),
          otherPlayers: this.gameController.getOtherUsers(player.id),
          game: usersGame?.getGameState(player.id),
        });
      }
    });
  };

  // utils
  private addClient = (clientId: string, wsClient: WebSocket) => {
    this.clientsMap[clientId] = wsClient;
  };
  private displayClientsMap = () => {
    // console.log('CLIENT_ID           |   WEBSOCKET ');
    // for (const clientId in this.clientsMap) {
    //   console.log(`${clientId}     ${Boolean(this.clientsMap[clientId])}`);
    // }
    // console.log('----------------------------------\n');
    console.log(this.clientsMap);
  };
  private displayPlayersMap = () => {
    // console.log('PLAYER_ID                         |  CLIENT_ID ');
    // for (const playerId in this.gameController.userClientMap) {
    //   console.log(`${playerId}    ${this.gameController.userClientMap[playerId]}`);
    // }
    // console.log('----------------------------------\n');
    console.log(this.gameController.playerClientMap);
  };
}

module.exports = Network;
