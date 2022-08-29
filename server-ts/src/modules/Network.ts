import { WebSocketServer, WebSocket, RawData } from 'ws';
import { HOST, PORT, MESSAGE_TYPE } from '../constants';
import { generateCryptoId } from '../helpers';
import { ApplyAbilityParams, Message } from '../types';
import Game from './Game';
import Player from './Player';

type GameMessageResponse = {
  message?: Message;
  doBroadcast?: boolean;
  toSenderOnly?: boolean;
};
type GameMessageHandler = (
  cliendId: string,
  message: Message<any>
) => GameMessageResponse;

class GameController {
  public game: Game | null;
  public playersMap: { [playerId: string]: string }; // playerId -> clientId
  public messageActionsMap: {
    [messageType: string]: GameMessageHandler;
  };

  constructor() {
    this.game = null;
    this.playersMap = {};
    this.messageActionsMap = {
      [MESSAGE_TYPE.HANDSHAKE]: this.onHandshake,
      [MESSAGE_TYPE.START]: this.onStart,
      [MESSAGE_TYPE.TAKE_CARD]: this.onTakeCard,
      [MESSAGE_TYPE.PLAY_CARD]: this.onPlayCard,
      [MESSAGE_TYPE.SUBMIT_ABILITY]: this.onSubmitAbility,
      [MESSAGE_TYPE.CANCEL_ABILITY]: this.onCancelAbility,
    };
  }

  private getPlayerIdByClientId = (cliendId: string) => {
    for (const playerId in this.playersMap) {
      if (cliendId === this.playersMap[playerId]) return playerId;
    }
    return undefined;
  };

  public onMessage = (
    message: Message,
    cliendId: string
  ): Message | undefined => {
    console.log(message);
    return message;
  };

  startGame = () => {
    this.game = new Game();
  };

  onHandshake: GameMessageHandler = (
    clientId: string,
    message: Message<{ playerId: string }>
  ) => {
    let playerId = message.playerId;

    if (playerId && playerId in this.playersMap) {
      this.playersMap[playerId] = clientId;
    } else {
      playerId = generateCryptoId();
      this.game!.addPlayer(new Player(playerId, this.game!.giveDefaulCards()));
      this.playersMap[playerId] = clientId;
    }

    return {
      message: {
        type: MESSAGE_TYPE.HANDSHAKE,
        playerId,
        game: this.game!.getGameState(playerId),
      },
      toSenderOnly: true,
    };
  };

  onStart: GameMessageHandler = () => {
    this.game!.setNextActivePlayer();

    return {
      message: {
        type: MESSAGE_TYPE.START,
      },
      doBroadcast: true,
    };
  };

  onTakeCard: GameMessageHandler = () => {
    this.game!.activePlayerTakesCard();
    return {
      message: {
        type: MESSAGE_TYPE.TAKE_CARD,
      },
      doBroadcast: true,
    };
  };

  onPlayCard: GameMessageHandler = (
    clientId,
    message: Message<{ cardId: number; monsterId: number }>
  ) => {
    try {
      const result = this.game!.activePlayerPutsCard(
        message.cardId,
        message.monsterId
      );
      return {
        message: result || {
          type: MESSAGE_TYPE.PLAY_CARD,
        },
        doBroadcast: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  onSubmitAbility = (
    cliendId: string,
    message: Message
  ): GameMessageResponse => {
    const { type, ...abilityParams } = message;
    const result = this.game!.applyAbility({
      ...abilityParams,
    } as ApplyAbilityParams); // TODO make this type USEFUL
    return {
      message: result || {
        type: MESSAGE_TYPE.PLAY_CARD,
      },
      doBroadcast: true,
    };
  };

  onCancelAbility: GameMessageHandler = () => {
    this.game!.stopAbilities();
    return {
      message: {
        type: MESSAGE_TYPE.PLAY_CARD,
      },
      doBroadcast: true,
    };
  };
}

export default class Network {
  private host: string;
  private port: number;
  private wsServer: WebSocketServer | null;
  private clientsMap: { [clientId: string]: WebSocket }; // clientId -> wsClient
  private gameController: GameController;

  constructor() {
    this.host = HOST || 'localhost';
    this.port = PORT || 9000;
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
      this.wsServer.on('connection', this.onConnection);
    }
    this.gameController.startGame();
  };

  onConnection = (wsClient: WebSocket) => {
    const clientId = Math.random().toString();
    console.log(`new client is connected ${clientId}`);
    this.addClient(clientId, wsClient);

    wsClient.on('message', (event) => this.onMessage(event, clientId)); // TODO find out event type
    wsClient.on('close', () => this.onClose(clientId));
  };

  onMessage = (event: RawData, clientId: string) => {
    const message: Message = JSON.parse(event.toString());
    console.log('==>', clientId, message);

    try {
      const gameResponse = this.gameController.messageActionsMap[message.type](
        clientId,
        message
      );

      if (gameResponse.toSenderOnly && gameResponse.message) {
        this.sendMessage(clientId, gameResponse.message);
      }
      if (gameResponse.doBroadcast && gameResponse.message) {
        this.broadcast(gameResponse.message);
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

  sendMessage = <T>(clientId: string, message: Message<T>) => {
    const wsClient = this.clientsMap[clientId];
    if (!wsClient) return;
    console.log('<==', message.type);
    wsClient.send(JSON.stringify(message));
  };

  broadcast = (message: Message) => {
    // TODO add gameState to payload
    //  game: this.game!.getGameState(player.id),
    this.gameController.game?.forEachPlayer((player) => {
      this.sendMessage(this.gameController.playersMap[player.id], {
        ...message,
        game: this.gameController.game!.getGameState(player.id),
      });
    });
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
    for (const playerId in this.gameController.playersMap) {
      console.log(`${playerId}    ${this.gameController.playersMap[playerId]}`);
    }
    console.log('----------------------------------\n');
  };
}

module.exports = Network;
