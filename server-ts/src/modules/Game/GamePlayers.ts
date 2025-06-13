import Player from 'src/modules/Player';

export default class GamePlayers {
  private players: Player[];
  private playerIdMap: { [playerId: string]: number }; // playerId -> индекс игрока в массиве _players
  private activePlayerIndex: number | null;

  constructor() {
    this.players = [];
    this.playerIdMap = {};
    this.activePlayerIndex = null;
  }

  public addPlayer = (player: Player) => {
    const playersArrayLength = this.players.push(player);
    this.playerIdMap[player.id] = playersArrayLength - 1;
  };

  public removePlayer = (playerId: string) => {
    const playerIndex = this.playerIdMap[playerId];
    this.players.splice(playerIndex, 1);
    this.reMapPlayers();
  };

  public resetPlayer = (playerId: string) => {
    this.getPlayerById(playerId).reset();
  };

  /** @todo add throw error if no activePlayer */
  public getActivePlayer = () => {
    if (this.activePlayerIndex === null) return null;
    return this.players[this.activePlayerIndex];
  };

  public getPlayerById = (id: string): Player => {
    return this.players[this.playerIdMap[id]];
  };

  public setNextActivePlayer(callback?: () => void) {
    if (!this.activePlayerIndex) {
      this.activePlayerIndex = 0;
    }
    this.activePlayerIndex =
      this.activePlayerIndex === this.players.length - 1 ? 0 : this.activePlayerIndex + 1;

    callback?.();
  }

  public getOtherPlayers = (playerId: string) => {
    return this.players.filter((player) => player.id !== playerId);
  };

  public forEachPlayer = (callback: (player: Player, index: number) => void) => {
    this.players.forEach(callback);
  };

  public getAllPlayers = () => {
    return this.players;
  };

  private reMapPlayers = () => {
    this.playerIdMap = {};
    this.players.forEach((player, index) => {
      this.playerIdMap[player.id] = index;
    });
  };

  public resetActivePlayer = () => {
    this.activePlayerIndex = null;
  };
}
