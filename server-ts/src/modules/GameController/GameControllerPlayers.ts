import Game from 'src/modules/Game';
import Player from 'src/modules/Player';

/** Управляет пулом всех существующих игр и подключенных игроков */
export default class GameControllerPlayers {
  /** Активные игры */
  public games: { [gameId: string]: Game };
  /** Мап веб-сокет клиентов игроков. Позволяет получить clientId игрока по его playerId */
  public playerClientMap: { [playerId: string]: string }; // playerId -> clientId
  /** Мап игроков */
  protected players: { [playerId: string]: Player };
  /** TMP clientId текущего админа */
  public adminClientId: string | null;

  constructor() {
    this.games = {};
    this.playerClientMap = {};
    this.players = {};
    this.adminClientId = null;
  }

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
