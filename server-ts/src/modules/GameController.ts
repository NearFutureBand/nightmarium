import { MESSAGE_TYPE } from "../constants";
import { randomFloat } from "../helpers";
import {
  AbilityMessagePayload,
  ApplyAbilityParams,
  GameState,
  Legion,
  Message,
} from "../types";
import Game from "./Game";
import Player, { User } from "./Player";

type GameMessageResponse = {
  broadcast?: Message;
  toSenderOnly?: Message;
  toAllExceptSender?: Message;
};
type GameMessageHandler<MessagePayloadType = {}> = (
  cliendId: string,
  message: Message<MessagePayloadType>
) => GameMessageResponse;

export default class GameController {
  public game: Game | null;
  public games: { [gameId: string]: Game };
  public userClientMap: { [userId: string]: string }; // playerId -> clientId
  public users: { [playerId: string]: User };
  public messageActionsMap: {
    [messageType: string]: GameMessageHandler<any>;
  };

  constructor() {
    this.game = null;
    this.games = {}; // TODO пока не используется
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
    };
  }

  private getPlayerIdByClientId = (cliendId: string) => {
    for (const playerId in this.userClientMap) {
      if (cliendId === this.userClientMap[playerId]) return playerId;
    }
    return undefined;
  };

  public processGameMessage = (
    clientId: string,
    message: Message
  ): GameMessageResponse => {
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

  getOtherPlayers = (exceptPlayerId: string) => {
    return Object.values(this.users).filter(
      (user) => user.id !== exceptPlayerId
    );
  };

  getGameById = (gameId?: string) => {
    if (!gameId) return undefined;
    return this.games[gameId];
  };

  onReadyToPlay: GameMessageHandler<{ playerId: string }> = (
    clientId,
    message
  ) => {
    const gameId = this.getAwaitingGameId() || this.createGame();
    // тут игра будет существовать 100%
    const game = this.getGameById(gameId)!;

    const user = this.users[message.playerId];
    const player = new Player(user.id, user.name);
    game.addPlayer(player);
    game.getPlayerById(message.playerId).engage(game.giveDefaulCards());
    user.setReadyToPlayState(true);
    user.gameId = gameId;

    if (this.areAllReadyToPlay()) {
      return this.sendStartGameMessage(gameId);
    }
    return {
      broadcast: {
        type: MESSAGE_TYPE.READY_TO_PLAY,
      },
    };
  };

  areAllReadyToPlay = () => {
    // TODO перепридумать логику этой функции. Нужно сосчитать все ли игроки нажали "готов"
    const allUsers = Object.values(this.users);
    const awaitingUsers = allUsers.filter((u) => u.readyToPlay);
    return (
      awaitingUsers.length >= 5 || awaitingUsers.length === allUsers.length
    );
  };

  onHandshake: GameMessageHandler<{ playerId: string }> = (
    clientId,
    message
  ) => {
    let playerId = message.playerId;
    let playerAlreadyExists = false;
    let user: User;

    if (playerId && playerId in this.userClientMap) {
      playerAlreadyExists = true;
      this.userClientMap[playerId] = clientId;
      user = this.users[playerId];
    } else {
      user = new User();
      playerId = user.id;
      this.userClientMap[user.id] = clientId;
      this.users[user.id] = user;
    }

    const otherPlayers = this.getOtherPlayers(playerId);

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
      game: usersGame?.getGameState?.(playerId),
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
    };
  };

  sendStartGameMessage = (gameId: string): GameMessageResponse => {
    this.getGameById(gameId)!.setNextActivePlayer();
    return {
      broadcast: {
        type: MESSAGE_TYPE.START,
      },
    };
  };

  onTakeCard: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    game.activePlayerTakesCard();
    return {
      broadcast: {
        type: MESSAGE_TYPE.TAKE_CARD,
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
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  onSubmitAbility = (
    cliendId: string,
    message: Message<any>
  ): GameMessageResponse => {
    const { type, gameId, ...abilityParams } = message;
    const game = this.getGameById(gameId);
    const result = game!.applyAbility({
      ...abilityParams,
    } as ApplyAbilityParams); // TODO make this type USEFUL
    return {
      broadcast: result || {
        type: MESSAGE_TYPE.PLAY_CARD,
      },
    };
  };

  onCancelAbility: GameMessageHandler<{ gameId: string }> = (
    cliendId,
    message
  ) => {
    const game = this.getGameById(message.gameId)!;
    const result = game.stopAbilitiesMode();

    return {
      broadcast: result || {
        type: MESSAGE_TYPE.PLAY_CARD,
      },
    };
  };

  onSetPlayerName: GameMessageHandler<{ playerId: string; name: string }> = (
    clientId,
    message
  ) => {
    const player = this.users[message.playerId];
    player?.setName(message.name);
    // Logger.log('SET PLAYER NAME', player);
    return {
      toSenderOnly: {
        type: MESSAGE_TYPE.NAME_ACCEPTED,
        me: player,
      },
    };
  };

  onThrowLegionCard: GameMessageHandler<{
    cardIds: number[];
    playerId: string;
    gameId: string;
  }> = (clientId, message) => {
    const game = this.getGameById(message.gameId)!;
    const result = game.playerThrowsLegionCard(
      message.playerId,
      message.cardIds
    );
    return {
      broadcast: result,
    };
  };

  onChangeCards: GameMessageHandler<{ cardIds: number[]; gameId: string }> = (
    clientId,
    message
  ) => {
    const game = this.getGameById(message.gameId)!;
    game.activePlayerExchangesCards(message.cardIds);
    return {
      broadcast: {
        type: MESSAGE_TYPE.CHANGE_CARDS,
      },
    };
  };

  onLeaveGame: GameMessageHandler<{ playerId: string; gameId: string }> = (
    clientId,
    message
  ) => {
    // remove player from game
    const game = this.getGameById(message.gameId)!;
    game.removePlayer(message.playerId);
    this.users[message.playerId].setReadyToPlayState(false);

    // stop game if no players left
    if (game!.players.length === 0) {
      this.endGame(message.gameId);
    }

    return {
      broadcast: {
        type: MESSAGE_TYPE.LEAVE_GAME,
      },
    };
  };
}
