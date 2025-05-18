import { AbilityMessagePayload, GameState, Legion, Message, MessageType } from '../types';
import Game from './Game';
import { Logger } from './Logger';
import Player from './Player';

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

class GamesState {
  public games: { [gameId: string]: Game };
  public playerClientMap: { [playerId: string]: string }; // playerId -> clientId
  protected players: { [playerId: string]: Player };
  public adminClientId: string | undefined;

  constructor() {
    this.games = {};
    this.playerClientMap = {};
    this.players = {};
  }

  // protected getUserIdByClientId = (cliendId: string) => {
  //   for (const playerId in this.playerClientMap) {
  //     if (cliendId === this.playerClientMap[playerId]) return playerId;
  //   }
  //   return undefined;
  // };

  protected createGame = () => {
    const game = new Game();
    this.games[game.id] = game;
    return game.id;
  };

  protected deleteGame = (gameId: string) => {
    delete this.games[gameId];
  };

  getAwaitingGameId = () => {
    for (const gameId in this.games) {
      if (!this.games[gameId].isGameStarted()) {
        return gameId;
      }
    }
  };

  getOtherUsers = (exceptUserId: string) => {
    return Object.values(this.players).filter((user) => user.id !== exceptUserId);
  };

  getGameById = (gameId: string | undefined) => {
    if (!gameId) return undefined;
    return this.games[gameId];
  };

  areAllReadyToPlay = () => {
    // TODO перепридумать логику этой функции. Нужно сосчитать все ли игроки нажали "готов"
    const allUsers = Object.values(this.players);
    const awaitingUsers = allUsers.filter((u) => u.readyToPlay);
    return awaitingUsers.length >= 5 || awaitingUsers.length === allUsers.length;
  };

  getPlayerById = (playerId: string) => {
    if (!(playerId in this.players)) return undefined;
    return this.players[playerId];
  };

  getPlayers = () => {
    return this.players;
  };
}

class GameMessagesController extends GamesState {
  public messageActionsMap: Partial<Record<MessageType, GameMessageHandler<any>>>;

  constructor() {
    super();
    this.messageActionsMap = {
      HANDSHAKE: this.onHandshake,
      SET_NAME: this.onSetPlayerName,
      READY_TO_PLAY: this.onReadyToPlay,
      TAKE_CARD: this.onTakeCard,
      PLAY_CARD: this.onPlayCard,
      EXCHANGE_CARDS: this.onChangeCards
      // [MESSAGE_TYPE.SUBMIT_ABILITY]: this.onSubmitAbility,
      // [MESSAGE_TYPE.CANCEL_ABILITY]: this.onCancelAbility,

      // [MESSAGE_TYPE.THROW_LEGION_CARD]: this.onThrowLegionCard,

      // [MESSAGE_TYPE.READY_TO_PLAY]: this.onReadyToPlay,
      // [MESSAGE_TYPE.LEAVE_GAME]: this.onLeaveGame,
      // [MESSAGE_TYPE.ADMIN_HANDSHAKE]: this.onAdminHandshake,
      // [MESSAGE_TYPE.ADMIN_RESORT_CARDS]: this.onAdminResortCards,
    };
  }

  public processGameMessage = (clientId: string, message: Message): GameMessageResponse => {
    try {
      const messageType = message.type;
      if (!(messageType in this.messageActionsMap)) {
        throw `Not found handler for ${message.type}`;
      }
      return this.messageActionsMap[messageType]?.(clientId, message) || {};
    } catch (error) {
      Logger.log('Process game message error', error);
      return {};
    }
  };

  private onHandshake: GameMessageHandler<{ playerId: string }> = (clientId, message) => {
    let playerId = message.playerId;
    let playerAlreadyExists = false;
    let player: Player;

    if (playerId && playerId in this.playerClientMap) {
      playerAlreadyExists = true;
      this.playerClientMap[playerId] = clientId;
      player = this.players[playerId];
    } else {
      player = new Player();
      playerId = player.id;
      this.playerClientMap[player.id] = clientId;
      this.players[player.id] = player;
    }

    const otherPlayers = this.getOtherUsers(playerId);

    const usersGame = this.getGameById(player.gameId);
    const messageToSender: Message<{
      me: Player;
      otherPlayers: Player[];
      game?: GameState;
      ability?: AbilityMessagePayload;
      legion?: Legion;
    }> = {
      type: 'HANDSHAKE',
      me: player,
      otherPlayers,
      game: usersGame?.getGameState?.(playerId),
      ability: usersGame?.abilitiesMode?.getMessagePayloadFromCurrentState?.(),
      legion: usersGame?.legionMode?.currentLegion
    };

    const messageToAllExceptSender = playerAlreadyExists
      ? undefined
      : {
          type: 'PLAYER_CONNECTED' as MessageType
        };

    return {
      toSenderOnly: messageToSender,
      toAllExceptSender: messageToAllExceptSender,
      toAdmin: {
        type: 'HANDSHAKE',
        games: this.games,
        users: this.players
      }
    };
  };

  private onSetPlayerName: GameMessageHandler<{ playerId: string; name: string }> = (
    clientId,
    message
  ) => {
    const player = this.getPlayerById(message.playerId);
    player?.setName(message.name);
    return {
      toSenderOnly: {
        type: 'NAME_ACCEPTED',
        me: player
      },
      toAdmin: {
        type: 'NAME_ACCEPTED',
        // @todo это можно добавлять не тут а выше
        games: this.games,
        users: this.players
      }
    };
  };

  private onReadyToPlay: GameMessageHandler<{ playerId: string }> = (clientId, message) => {
    const { playerId } = message;
    const gameId = this.getAwaitingGameId() || this.createGame();
    const game = this.getGameById(gameId)!;
    const player = this.players[playerId];

    game.addPlayer(player);
    player.setReadyToPlayState(true);
    player.gameId = gameId;

    if (this.areAllReadyToPlay()) {
      return this.sendStartGameMessage(gameId);
    }
    return {
      broadcast: {
        type: 'READY_TO_PLAY'
      },
      toAdmin: {
        type: 'READY_TO_PLAY',
        games: this.games,
        users: this.players
      }
    };
  };

  private sendStartGameMessage = (gameId: string) => {
    this.getGameById(gameId)?.start();
    return {
      broadcast: {
        type: 'START'
      },
      toAdmin: {
        type: 'START',
        games: this.games,
        users: this.players
      }
    } as GameMessageResponse;
  };

  private onPlayCard: GameMessageHandler<{
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
          type: 'PLAY_CARD'
        },
        toAdmin: {
          type: 'PLAY_CARD',
          games: this.games,
          users: this.players
        }
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  private onChangeCards: GameMessageHandler<{ cardIds: number[]; gameId: string }> = (
    clientId,
    message
  ) => {
    const game = this.getGameById(message.gameId)!;
    game.activePlayerExchangesCards(message.cardIds);
    return {
      broadcast: {
        type: 'EXCHANGE_CARDS'
      },
      toAdmin: {
        type: 'EXCHANGE_CARDS',
        games: this.games,
        users: this.players
      }
    };
  };

  onTakeCard: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    game.activePlayerTakesCard();
    return {
      broadcast: {
        type: 'TAKE_CARD'
      },
      toAdmin: {
        type: 'TAKE_CARD',
        games: this.games,
        users: this.players
      }
    };
  };
}

export default class GameController extends GameMessagesController {
  constructor() {
    super();
  }
}

class GameControllerOld {
  // public games: { [gameId: string]: Game };
  // public playerClientMap: { [playerId: string]: string }; // userId -> clientId
  // public players: { [userId: string]: Player };
  // public adminClientId: string | undefined;
  // constructor() {
  //   this.games = {};
  //   this.playerClientMap = {};
  //   this.players = {};
  // }
  // private getUserIdByClientId = (cliendId: string) => {
  //   for (const userId in this.playerClientMap) {
  //     if (cliendId === this.playerClientMap[userId]) return userId;
  //   }
  //   return undefined;
  // };
  // public processGameMessage = (clientId: string, message: Message): GameMessageResponse => {
  //   return this.messageActionsMap[message.type](clientId, message);
  // };
  // private createGame = () => {
  //   const gameId = `${randomFloat()}`;
  //   const game = new Game(gameId);
  //   this.games[gameId] = game;
  //   return gameId;
  // };
  // private deleteGame = (gameId: string) => {
  //   delete this.games[gameId];
  // };
  // private getAwaitingGameId = () => {
  //   for (const gameId in this.games) {
  //     if (!this.games[gameId].isGameStarted()) {
  //       return gameId;
  //     }
  //   }
  // };
  // getOtherUsers = (exceptUserId: string) => {
  //   return Object.values(this.players).filter((user) => user.id !== exceptUserId);
  // };
  // getGameById = (gameId?: string) => {
  //   if (!gameId) return undefined;
  //   return this.games[gameId];
  // };
  /**
   * Тут создается инстанс Player и Game, если нужно
   * @param clientId
   * @param message
   * @returns
   */
  // onReadyToPlay: GameMessageHandler<{ userId: string }> = (
  //   // TODO в СООБЩЕНИИ заменить на userId
  //   clientId,
  //   message
  // ) => {
  //   const gameId = this.getAwaitingGameId() || this.createGame();
  //   // тут игра будет существовать 100%
  //   const game = this.getGameById(gameId)!;
  //   const player = this.players[message.userId];
  //   // const player = new Player(user.id, user.name);
  //   game.addPlayer(player);
  //   game.getPlayerById(message.userId).engage(game.giveDefaulCards());
  //   player.setReadyToPlayState(true);
  //   player.gameId = gameId;
  //   if (this.areAllReadyToPlay()) {
  //     return this.sendStartGameMessage(gameId);
  //   }
  //   return {
  //     broadcast: {
  //       type: MESSAGE_TYPE.READY_TO_PLAY,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.READY_TO_PLAY,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // areAllReadyToPlay = () => {
  //   // TODO перепридумать логику этой функции. Нужно сосчитать все ли игроки нажали "готов"
  //   const allUsers = Object.values(this.players);
  //   const awaitingUsers = allUsers.filter((u) => u.readyToPlay);
  //   return awaitingUsers.length >= 5 || awaitingUsers.length === allUsers.length;
  // };
  // onAdminHandshake: GameMessageHandler = (clientId, message) => {
  //   this.adminClientId = clientId;
  //   return {
  //     toAdmin: {
  //       type: MESSAGE_TYPE.ADMIN_HANDSHAKE,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // sendStartGameMessage = (gameId: string) => {
  //   this.getGameById(gameId)!.setNextActivePlayer();
  //   return {
  //     broadcast: {
  //       type: MESSAGE_TYPE.START,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.START,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   } as GameMessageResponse;
  // };
  // onTakeCard: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
  //   const game = this.getGameById(message.gameId)!;
  //   game.activePlayerTakesCard();
  //   return {
  //     broadcast: {
  //       type: MESSAGE_TYPE.TAKE_CARD,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.TAKE_CARD,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // onPlayCard: GameMessageHandler<{
  //   cardId: number;
  //   monsterId: number;
  //   gameId: string;
  // }> = (clientId, message) => {
  //   try {
  //     const result = this.getGameById(message.gameId)!.activePlayerPutsCard(
  //       message.cardId,
  //       message.monsterId
  //     );
  //     return {
  //       broadcast: result || {
  //         type: MESSAGE_TYPE.PLAY_CARD,
  //       },
  //       toAdmin: {
  //         type: MESSAGE_TYPE.PLAY_CARD,
  //         games: this.games,
  //         users: this.players,
  //       },
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };
  // onSubmitAbility: GameMessageHandler = (cliendId: string, message: Message<any>) => {
  //   const { type, gameId, ...abilityParams } = message;
  //   const game = this.getGameById(gameId);
  //   const result = game!.applyAbility({
  //     ...abilityParams,
  //   } as ApplyAbilityParams); // TODO make this type USEFUL
  //   return {
  //     broadcast: result || {
  //       type: MESSAGE_TYPE.PLAY_CARD,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.PLAY_CARD,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // onCancelAbility: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
  //   const game = this.getGameById(message.gameId)!;
  //   const result = game.stopAbilitiesMode();
  //   return {
  //     broadcast: result || {
  //       type: MESSAGE_TYPE.PLAY_CARD,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.PLAY_CARD,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // // TODO в СООБЩЕНИИ заменить на userId
  // onSetPlayerName: GameMessageHandler<{ userId: string; name: string }> = (clientId, message) => {
  //   const user = this.players[message.userId];
  //   user?.setName(message.name);
  //   // Logger.log('SET PLAYER NAME', player);
  //   return {
  //     toSenderOnly: {
  //       type: MESSAGE_TYPE.NAME_ACCEPTED,
  //       me: user,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.NAME_ACCEPTED,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // onThrowLegionCard: GameMessageHandler<{
  //   cardIds: number[];
  //   playerId: string;
  //   gameId: string;
  // }> = (clientId, message) => {
  //   const game = this.getGameById(message.gameId)!;
  //   const result = game.playerThrowsLegionCard(message.playerId, message.cardIds);
  //   return {
  //     broadcast: result,
  //     toAdmin: {
  //       type: MESSAGE_TYPE.AWAIT_LEGION_CARD,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // onChangeCards: GameMessageHandler<{ cardIds: number[]; gameId: string }> = (clientId, message) => {
  //   const game = this.getGameById(message.gameId)!;
  //   game.activePlayerExchangesCards(message.cardIds);
  //   return {
  //     broadcast: {
  //       type: MESSAGE_TYPE.CHANGE_CARDS,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.CHANGE_CARDS,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // onLeaveGame: GameMessageHandler<{ userId: string; gameId: string }> = (clientId, message) => {
  //   // remove player from game
  //   const game = this.getGameById(message.gameId)!;
  //   game.removePlayer(message.userId);
  //   this.players[message.userId].setReadyToPlayState(false);
  //   // stop game if no players left
  //   if (game!.players.length === 0) {
  //     this.deleteGame(message.gameId);
  //   }
  //   return {
  //     broadcast: {
  //       type: MESSAGE_TYPE.LEAVE_GAME,
  //     },
  //     toAdmin: {
  //       type: MESSAGE_TYPE.LEAVE_GAME,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
  // onAdminResortCards: GameMessageHandler<{ gameId: string; cardId: number; targetIndex: number }> = (
  //   cliendId,
  //   message
  // ) => {
  //   const game = this.getGameById(message.gameId)!;
  //   game.replaceCards(message.cardId, message.targetIndex);
  //   return {
  //     toAdmin: {
  //       type: MESSAGE_TYPE.ADMIN_RESORT_CARDS,
  //       games: this.games,
  //       users: this.players,
  //     },
  //   };
  // };
}
