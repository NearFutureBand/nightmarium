import { randomFloat } from '../helpers';
import { MESSAGE_TYPE } from '../shared/types';
import { AbilityMessagePayload, ApplyAbilityParams, Card, GameState, Legion, Message } from '../types';
import Game from './Game';
import Player, { User } from './Player';

type GameMessageResponse = {
  broadcast?: Message;
  toSenderOnly?: Message;
  toAllExceptSender?: Message;
  toAdmin?: Message;
  toSpectator?: Message;
};
type GameMessageHandler<MessagePayloadType = {}> = (
  cliendId: string,
  message: Message<MessagePayloadType>
) => GameMessageResponse;

export default class GameController {
  // public game: Game | null;
  public games: { [gameId: string]: Game };
  public userClientMap: { [userId: string]: string }; // userId -> clientId
  public users: { [userId: string]: User };
  public adminClientId: string | undefined;
  public messageActionsMap: {
    [messageType: string]: GameMessageHandler<any>;
  };

  constructor() {
    // this.game = null;
    this.games = {};
    this.userClientMap = {};
    this.users = {};
    this.messageActionsMap = {
      [MESSAGE_TYPE.HANDSHAKE]: this.onHandshake,
      [MESSAGE_TYPE.TAKE_CARD]: this.onTakeCard,
      [MESSAGE_TYPE.PLAY_CARD]: this.onPlayCard,
      [MESSAGE_TYPE.SUBMIT_ABILITY]: this.onSubmitAbility,
      [MESSAGE_TYPE.CANCEL_ABILITY]: this.onCancelAbility,
      [MESSAGE_TYPE.SET_NAME]: this.onSetPlayerName,
      [MESSAGE_TYPE.THROW_LEGION_CARD]: this.onThrowLegionCard,
      [MESSAGE_TYPE.CHANGE_CARDS]: this.onChangeCards,
      [MESSAGE_TYPE.READY_TO_PLAY]: this.onReadyToPlay,
      [MESSAGE_TYPE.LEAVE_GAME]: this.onLeaveGame,
      [MESSAGE_TYPE.ADMIN_HANDSHAKE]: this.onAdminHandshake,
      [MESSAGE_TYPE.ADMIN_RESORT_CARDS]: this.onAdminResortCards,
    };
  }

  private getUserIdByClientId = (cliendId: string) => {
    for (const userId in this.userClientMap) {
      if (cliendId === this.userClientMap[userId]) return userId;
    }
    return undefined;
  };

  public processGameMessage = (clientId: string, message: Message): GameMessageResponse => {
    return this.messageActionsMap[message.type](clientId, message);
  };

  private createGame = () => {
    const gameId = `${randomFloat()}`;
    const game = new Game(gameId);
    this.games[gameId] = game;
    return gameId;
  };

  private endGame = (gameId: string) => {
    delete this.games[gameId];
  };

  private getAwaitingGameId = () => {
    for (const gameId in this.games) {
      if (!this.games[gameId].isGameStarted()) {
        return gameId;
      }
    }
  };

  getOtherUsers = (exceptUserId: string) => {
    return Object.values(this.users).filter((user) => user.id !== exceptUserId);
  };

  getGameById = (gameId?: string) => {
    if (!gameId) return undefined;
    return this.games[gameId];
  };

  /**
   * Тут создается инстанс Player и Game, если нужно
   * @param clientId
   * @param message
   * @returns
   */
  onReadyToPlay: GameMessageHandler<{ userId: string }> = (
    // TODO в СООБЩЕНИИ заменить на userId
    clientId,
    message
  ) => {
    const gameId = this.getAwaitingGameId() || this.createGame();
    // тут игра будет существовать 100%
    const game = this.getGameById(gameId)!;

    const user = this.users[message.userId];
    const player = new Player(user.id, user.name);
    game.addPlayer(player);
    game.getPlayerById(message.userId).engage(game.giveDefaulCards());
    user.setReadyToPlayState(true);
    user.gameId = gameId;

    if (this.areAllReadyToPlay()) {
      return this.sendStartGameMessage(gameId);
    }
    return {
      broadcast: {
        type: MESSAGE_TYPE.READY_TO_PLAY,
      },
      toAdmin: {
        type: MESSAGE_TYPE.READY_TO_PLAY,
        games: this.games,
        users: this.users,
      },
    };
  };

  areAllReadyToPlay = () => {
    // TODO перепридумать логику этой функции. Нужно сосчитать все ли игроки нажали "готов"
    const allUsers = Object.values(this.users);
    const awaitingUsers = allUsers.filter((u) => u.readyToPlay);
    return awaitingUsers.length >= 5 || awaitingUsers.length === allUsers.length;
  };

  onHandshake: GameMessageHandler<{ userId: string }> = (
    // TODO в СООБЩЕНИИ заменить на userId
    clientId,
    message
  ) => {
    let userId = message.userId;
    let playerAlreadyExists = false;
    let user: User;

    if (userId && userId in this.userClientMap) {
      playerAlreadyExists = true;
      this.userClientMap[userId] = clientId;
      user = this.users[userId];
    } else {
      user = new User();
      userId = user.id;
      this.userClientMap[user.id] = clientId;
      this.users[user.id] = user;
    }

    const otherPlayers = this.getOtherUsers(userId);

    const usersGame = this.getGameById(user.gameId);
    const messageToSender: Message<{
      me: User;
      otherPlayers: User[];
      game?: GameState;
      ability?: AbilityMessagePayload;
      legion?: Legion;
    }> = {
      type: MESSAGE_TYPE.HANDSHAKE,
      me: user,
      otherPlayers,
      game: usersGame?.getGameState?.(userId),
      ability: usersGame?.abilitiesMode?.getMessagePayloadFromCurrentState?.(),
      legion: usersGame?.legionMode?.currentLegion,
    };

    const messageToAllExceptSender = playerAlreadyExists
      ? undefined
      : {
          type: MESSAGE_TYPE.PLAYER_CONNECTED,
        };

    return {
      toSenderOnly: messageToSender,
      toAllExceptSender: messageToAllExceptSender,
      toAdmin: {
        type: MESSAGE_TYPE.HANDSHAKE,
        games: this.games,
        users: this.users,
      },
    };
  };

  onAdminHandshake: GameMessageHandler = (clientId, message) => {
    this.adminClientId = clientId;

    return {
      toAdmin: {
        type: MESSAGE_TYPE.ADMIN_HANDSHAKE,
        games: this.games,
        users: this.users,
      },
    };
  };

  sendStartGameMessage = (gameId: string) => {
    this.getGameById(gameId)!.setNextActivePlayer();
    return {
      broadcast: {
        type: MESSAGE_TYPE.START,
      },
      toAdmin: {
        type: MESSAGE_TYPE.START,
        games: this.games,
        users: this.users,
      },
    } as GameMessageResponse;
  };

  onTakeCard: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    game.activePlayerTakesCard();
    return {
      broadcast: {
        type: MESSAGE_TYPE.TAKE_CARD,
      },
      toAdmin: {
        type: MESSAGE_TYPE.TAKE_CARD,
        games: this.games,
        users: this.users,
      },
    };
  };

  onPlayCard: GameMessageHandler<{
    cardId: number;
    monsterId: number;
    gameId: string;
  }> = (clientId, message) => {
    try {
      const result = this.getGameById(message.gameId)!.activePlayerPutsCard(
        message.cardId,
        message.monsterId
      );
      return {
        broadcast: result || {
          type: MESSAGE_TYPE.PLAY_CARD,
        },
        toAdmin: {
          type: MESSAGE_TYPE.PLAY_CARD,
          games: this.games,
          users: this.users,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  onSubmitAbility: GameMessageHandler = (cliendId: string, message: Message<any>) => {
    const { type, gameId, ...abilityParams } = message;
    const game = this.getGameById(gameId);
    const result = game!.applyAbility({
      ...abilityParams,
    } as ApplyAbilityParams); // TODO make this type USEFUL
    return {
      broadcast: result || {
        type: MESSAGE_TYPE.PLAY_CARD,
      },
      toAdmin: {
        type: MESSAGE_TYPE.PLAY_CARD,
        games: this.games,
        users: this.users,
      },
    };
  };

  onCancelAbility: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    const result = game.stopAbilitiesMode();

    return {
      broadcast: result || {
        type: MESSAGE_TYPE.PLAY_CARD,
      },
      toAdmin: {
        type: MESSAGE_TYPE.PLAY_CARD,
        games: this.games,
        users: this.users,
      },
    };
  };

  // TODO в СООБЩЕНИИ заменить на userId
  onSetPlayerName: GameMessageHandler<{ userId: string; name: string }> = (clientId, message) => {
    const user = this.users[message.userId];
    user?.setName(message.name);
    // Logger.log('SET PLAYER NAME', player);
    return {
      toSenderOnly: {
        type: MESSAGE_TYPE.NAME_ACCEPTED,
        me: user,
      },
      toAdmin: {
        type: MESSAGE_TYPE.NAME_ACCEPTED,
        games: this.games,
        users: this.users,
      },
    };
  };

  onThrowLegionCard: GameMessageHandler<{
    cardIds: number[];
    playerId: string;
    gameId: string;
  }> = (clientId, message) => {
    const game = this.getGameById(message.gameId)!;
    const result = game.playerThrowsLegionCard(message.playerId, message.cardIds);
    return {
      broadcast: result,
      toAdmin: {
        type: MESSAGE_TYPE.AWAIT_LEGION_CARD,
        games: this.games,
        users: this.users,
      },
    };
  };

  onChangeCards: GameMessageHandler<{ cardIds: number[]; gameId: string }> = (clientId, message) => {
    const game = this.getGameById(message.gameId)!;
    game.activePlayerExchangesCards(message.cardIds);
    return {
      broadcast: {
        type: MESSAGE_TYPE.CHANGE_CARDS,
      },
      toAdmin: {
        type: MESSAGE_TYPE.CHANGE_CARDS,
        games: this.games,
        users: this.users,
      },
    };
  };

  onLeaveGame: GameMessageHandler<{ userId: string; gameId: string }> = (clientId, message) => {
    // remove player from game
    const game = this.getGameById(message.gameId)!;
    game.removePlayer(message.userId);
    this.users[message.userId].setReadyToPlayState(false);

    // stop game if no players left
    if (game!.players.length === 0) {
      this.endGame(message.gameId);
    }

    return {
      broadcast: {
        type: MESSAGE_TYPE.LEAVE_GAME,
      },
      toAdmin: {
        type: MESSAGE_TYPE.LEAVE_GAME,
        games: this.games,
        users: this.users,
      },
    };
  };

  onAdminResortCards: GameMessageHandler<{ gameId: string; cardId: number; targetIndex: number }> = (
    cliendId,
    message
  ) => {
    const game = this.getGameById(message.gameId)!;
    game.replaceCards(message.cardId, message.targetIndex);

    return {
      toAdmin: {
        type: MESSAGE_TYPE.ADMIN_RESORT_CARDS,
        games: this.games,
        users: this.users,
      },
    };
  };
}
