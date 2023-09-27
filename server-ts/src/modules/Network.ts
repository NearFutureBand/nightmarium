import { WebSocketServer, WebSocket, RawData } from "ws";
import { HOST, PORT } from "../constants";
import { Message } from "../types";
import GameController from "./GameController";

export default class Network {
  private host: string;
  private port: number;
  private wsServer: WebSocketServer | null;
  private clientsMap: { [clientId: string]: WebSocket }; // clientId -> wsClient
  private gameController: GameController;

  constructor() {
    this.host = HOST;
    this.port = PORT;
    this.wsServer = null;
    this.clientsMap = {};
    this.gameController = new GameController();
  }

  addClient = (clientId: string, wsClient: WebSocket) => {
    this.clientsMap[clientId] = wsClient;
  };

  launchServer = () => {
    if (!this.wsServer) {
      this.wsServer = new WebSocketServer({ host: this.host, port: this.port });
      console.log(" ======= Server started ====== ");
      this.wsServer.on("connection", this.onConnection);
    }
  };

  onConnection = (wsClient: WebSocket) => {
    const clientId = Math.random().toString();
    console.log(`new client is connected ${clientId}`);
    this.addClient(clientId, wsClient);

    wsClient.on("message", (event) => this.onMessage(event, clientId)); // TODO find out event type
    wsClient.on("close", () => this.onClose(clientId));
    this.displayClientsMap();
  };

  onMessage = (event: RawData, clientId: string) => {
    const message: Message = JSON.parse(event.toString());
    // Logger.logIncomingMessage(clientId, message);

    try {
      const gameResponse = this.gameController.processGameMessage(
        clientId,
        message
      );
      // Logger.log('<=== OUTCOMING MESSAGES', gameResponse);

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
      // Logger.logGenericError(error);
    }
  };

  onClose = (clientId: string) => {
    console.log(`${clientId} disconnected`);
    delete this.clientsMap[clientId];
    // TODO broadcast ?
    this.displayClientsMap();
    this.displayPlayersMap();
  };

  sendMessage = <T>(clientId: string, message: Message<T>) => {
    const wsClient = this.clientsMap[clientId];
    if (!wsClient) return;
    console.log("<==", message.type);
    wsClient.send(JSON.stringify(message));
  };

  broadcast = (message: Message) => {
    Object.values(this.gameController.users).forEach((user) => {
      const usersGame = this.gameController.getGameById(user.gameId);
      this.sendMessage(this.gameController.userClientMap[user.id], {
        ...message,
        me: this.gameController.users[user.id],
        otherPlayers: this.gameController.getOtherPlayers(user.id),
        game: usersGame?.getGameState(user.id),
      });
    });
  };

  broadcastExceptOne = (message: Message, exceptClientId: string) => {
    Object.values(this.gameController.users).forEach((user) => {
      const clientId = this.gameController.userClientMap[user.id];
      if (clientId !== exceptClientId) {
        const usersGame = this.gameController.getGameById(user.gameId);
        this.sendMessage(clientId, {
          ...message,
          me: this.gameController.users[user.id],
          otherPlayers: this.gameController.getOtherPlayers(user.id),
          game: usersGame?.getGameState(user.id),
        });
      }
    });
  };

  displayClientsMap = () => {
    console.log("CLIENT_ID           |   WEBSOCKET ");
    for (const clientId in this.clientsMap) {
      console.log(`${clientId}     ${Boolean(this.clientsMap[clientId])}`);
    }
    console.log("----------------------------------\n");
  };

  displayPlayersMap = () => {
    console.log("PLAYER_ID                         |  CLIENT_ID ");
    for (const playerId in this.gameController.userClientMap) {
      console.log(
        `${playerId}    ${this.gameController.userClientMap[playerId]}`
      );
    }
    console.log("----------------------------------\n");
  };
}

module.exports = Network;
