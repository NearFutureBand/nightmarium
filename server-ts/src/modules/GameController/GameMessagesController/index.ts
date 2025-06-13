import { GameState, Message, MessageType, PlayerState } from 'src/types';
import { Logger } from 'src/modules/Logger';
import Player from 'src/modules/Player';
import GameFabric from '../GameFabric';
import { Legion } from 'src/modules/Game/GameModes/Legion/types';
import { AbilityStateSerialized } from 'src/modules/Game/GameModes/Abilities/types';

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

export default class GameMessagesController extends GameFabric {
  public messageActionsMap: Partial<Record<MessageType, GameMessageHandler<any>>>;

  constructor() {
    super();
    this.messageActionsMap = {
      HANDSHAKE: this.onHandshake,
      SET_NAME: this.onSetPlayerName,
      READY_TO_PLAY: this.onReadyToPlay,
      TAKE_CARD: this.onTakeCard,
      PLAY_CARD: this.onPlayCard,
      EXCHANGE_CARDS: this.onExchangeCards,
      SUBMIT_ABILITY: this.onSubmitAbility,
      CANCEL_ABILITY: this.onCancelAbility,
      THROW_LEGION_CARD: this.onThrowLegionCard,
      LEAVE_GAME: this.onLeaveGame,
      ADMIN_HANDSHAKE: this.onAdminHandshake,
      ADMIN_RESORT_CARDS: this.onAdminResortCards
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

    const otherPlayers = this.getOtherUsers(playerId).map((player) => player.serialize());

    const usersGame = this.getGameById(player.gameId);
    const messageToSender: Message<{
      me: PlayerState;
      otherPlayers: PlayerState[];
      game?: GameState;
      ability?: AbilityStateSerialized;
      legion?: Legion;
    }> = {
      type: 'HANDSHAKE',
      me: player.serialize(),
      otherPlayers,
      game: usersGame?.serialize(playerId)
      /** @todo get back later */
      // ability: usersGame?.abilitiesMode?.serialize?.(),
      /** @todo get back later */
      // legion: usersGame?.legionMode?.currentLegion
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
      game.start();
      return {
        broadcast: {
          type: 'START'
        },
        toAdmin: {
          type: 'START',
          games: this.games,
          users: this.players
        }
      };
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

  private onPlayCard: GameMessageHandler<{
    cardId: number;
    monsterId: number;
    gameId: string;
  }> = (clientId, message) => {
    try {
      const result = this.getGameById(message.gameId)!.playerPutsCard(
        message.cardId,
        message.monsterId
      );
      if (result.error) {
        return {
          toSenderOnly: {
            type: 'PLAY_CARD',
            error: result.error
          }
        };
      }
      if (result.gameOver) {
        return {
          broadcast: {
            type: 'GAME_OVER'
            // winnerId ?
          }
        };
      }
      if (result.legionMode) {
        return {
          broadcast: {
            type: 'AWAIT_LEGION_CARD'
          }
        };
      }
      if (result.abilitiesMode) {
        return {
          broadcast: {
            type: 'AWAIT_ABILITY'
          }
        };
      }
      return {
        broadcast: {
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

  private onExchangeCards: GameMessageHandler<{ cardIds: number[]; gameId: string }> = (
    clientId,
    message
  ) => {
    const game = this.getGameById(message.gameId)!;
    game.playerExchangesCards(message.cardIds);
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

  private onTakeCard: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    game.playerTakesCard();
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

  /** @todo refactor */
  private onSubmitAbility: GameMessageHandler = (cliendId: string, message: Message<any>) => {
    const { type, gameId, ...abilityParams } = message;
    const game = this.getGameById(gameId);
    const result = game?.playerUsesAbility(abilityParams);
    /** @todo get this back later */
    // const result = game!.applyAbility({
    //   ...abilityParams
    // } as ApplyAbilityParams); // TODO make this type USEFUL
    return {
      // broadcast: result || {
      //   type: 'PLAY_CARD'
      // },
      toAdmin: {
        type: 'PLAY_CARD',
        games: this.games,
        users: this.players
      }
    };
  };

  /** @todo refactor */
  private onCancelAbility: GameMessageHandler<{ gameId: string }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    /** @todo get this back later */
    const result = game.stopAbilitiesMode();
    return {
      // broadcast: result || {
      //   type: 'PLAY_CARD'
      // },
      toAdmin: {
        type: 'PLAY_CARD',
        games: this.games,
        users: this.players
      }
    };
  };

  private onThrowLegionCard: GameMessageHandler<{
    cardIds: number[];
    playerId: string;
    gameId: string;
  }> = (clientId, message) => {
    const game = this.getGameById(message.gameId)!;
    const result = game.playerThrowsLegionCard(message.playerId, message.cardIds);

    if (result.error) {
      return {
        toSenderOnly: {
          type: 'AWAIT_LEGION_CARD',
          error: result.error
        }
      };
    }

    // @ts-ignore
    if (result.abilityMode) {
      return {
        broadcast: {
          type: 'AWAIT_ABILITY'
        }
      };
    }

    return {
      broadcast: {
        type: 'AWAIT_LEGION_CARD'
      },
      toAdmin: {
        type: 'AWAIT_LEGION_CARD',
        games: this.games,
        users: this.players
      }
    };
  };

  private onLeaveGame: GameMessageHandler<{ playerId: string; gameId: string }> = (
    clientId,
    message
  ) => {
    const game = this.getGameById(message.gameId);
    game?.removePlayer(message.playerId);
    this.players[message.playerId].setReadyToPlayState(false);
    if (game && game.howManyPlayers() === 0) {
      this.deleteGame(message.gameId);
    }
    return {
      broadcast: {
        type: 'LEAVE_GAME'
      },
      toAdmin: {
        type: 'LEAVE_GAME',
        games: this.games,
        users: this.players
      }
    };
  };

  private onAdminHandshake: GameMessageHandler = (clientId, message) => {
    this.adminClientId = clientId;
    return {
      toAdmin: {
        type: 'ADMIN_HANDSHAKE',
        games: this.games,
        users: this.players
      }
    };
  };

  private onAdminResortCards: GameMessageHandler<{
    gameId: string;
    cardId: number;
    targetIndex: number;
  }> = (cliendId, message) => {
    const game = this.getGameById(message.gameId)!;
    game.changeCardOrder(message.cardId, message.targetIndex);
    return {
      toAdmin: {
        type: 'ADMIN_RESORT_CARDS',
        games: this.games,
        users: this.players
      }
    };
  };
}
