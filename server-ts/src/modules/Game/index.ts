import Player from 'src/modules/Player';
import GameActions from './GameActions';
import { GameState, PlayerState } from 'src/types';
import { sortBy } from 'lodash';

export default class Game extends GameActions {
  constructor() {
    super();
  }

  public addPlayer = (player: Player) => {
    this.players.addPlayer(player);
  };

  public removePlayer = (playerId: string) => {
    this.players.removePlayer(playerId);
  };

  public howManyPlayers = () => {
    return this.players.getAllPlayers().length;
  };

  public start = () => {
    this.players.getAllPlayers().forEach((player) => player.engage(this.cards.giveDefaulCards()));
    this.minusAction();
  };

  public isGameStarted = () => {
    const activePlayer = this.players.getActivePlayer();
    return activePlayer !== null;
  };

  public serialize = (requestPlayerId?: string): GameState => {
    let activePlayer: PlayerState | undefined = undefined;
    try {
      activePlayer = this.players.getActivePlayer()?.serialize();
    } catch (error: any) {
      console.log('ERROR: ', error.message);
    }

    return {
      id: this.id,
      activePlayer,
      me: requestPlayerId
        ? this.players.getPlayerById(requestPlayerId)?.serialize(true)
        : undefined,
      otherPlayers: sortBy(
        this.players
          .getAllPlayers()
          .filter((player) => player.id !== requestPlayerId)
          .map((player) => player.serialize()),
        'id'
      ),
      actions: this.actions,
      lastAction: this.lastAction,
      winnerId: this.winnerId,
      legionMode: this.legionState?.serialize(),
      abilitiesMode: this.abilities?.serialize()
    };
  };
}
