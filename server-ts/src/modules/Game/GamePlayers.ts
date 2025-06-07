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

  addPlayer = (player: Player) => {
    const playersArrayLength = this.players.push(player);
    this.playerIdMap[player.id] = playersArrayLength - 1;
  };

  removePlayer = (playerId: string) => {
    const playerIndex = this.playerIdMap[playerId];
    this.players.splice(playerIndex, 1);
    this.reMapPlayers();
  };

  resetPlayer = (playerId: string) => {
    this.getPlayerById(playerId).reset();
  };

  /** @todo add try-catch if no activePlayer */
  getActivePlayer = () => {
    if (this.activePlayerIndex === null) return null;
    return this.players[this.activePlayerIndex];
  };

  getPlayerById = (id: string): Player => {
    return this.players[this.playerIdMap[id]];
  };

  setNextActivePlayer(callback?: () => void) {
    if (!this.activePlayerIndex) {
      this.activePlayerIndex = 0;
    }
    this.activePlayerIndex =
      this.activePlayerIndex === this.players.length - 1 ? 0 : this.activePlayerIndex + 1;

    callback?.();
  }

  getOtherPlayers = (playerId: string) => {
    return this.players.filter((player) => player.id !== playerId);
  };

  forEachPlayer = (callback: (player: Player, index: number) => void) => {
    this.players.forEach(callback);
  };

  getAllPlayers = () => {
    return this.players;
  };

  private reMapPlayers = () => {
    this.playerIdMap = {};
    this.players.forEach((player, index) => {
      this.playerIdMap[player.id] = index;
    });
  };
}
