import GamePlayers from './GamePlayers';
import GameCards from './GameCards';

export default class GameState {
  public id: string;
  protected actions: number;
  protected lastAction: string | null;
  protected winnerId: string | null;

  protected players: GamePlayers;
  protected cards: GameCards;

  // protected abilitiesMode: AbilitiesMode;
  // protected legionMode: LegionMode;

  // игровые настройки
  protected monstersToWin: number;

  constructor() {
    this.id = crypto.randomUUID();
    this.actions = 0;
    this.lastAction = null;
    this.winnerId = null;

    this.players = new GamePlayers();
    this.cards = new GameCards();

    // this.abilitiesMode = new AbilitiesMode();
    // this.legionMode = new LegionMode();

    this.monstersToWin = 5;
  }

  /** Subtracts one action within the turn but not passes the turn to
   * the next player - used if a monster is complete and there's need
   * to start legionMode or abilityMode
   */
  protected minusActionWithoutPassToNextPlayer = (lastAction?: string) => {
    if (lastAction !== undefined) {
      this.lastAction = lastAction;
    }
    this.actions -= 1;
  };

  /** Subtracts one action within the turn. If no actions left passes
   * the turn to the next player
   */
  protected minusAction = (lastAction?: string) => {
    this.minusActionWithoutPassToNextPlayer(lastAction);
    if (this.actions <= 0) {
      this.players.setNextActivePlayer(() => {
        this.actions = 2;
        this.lastAction = null;
      });
    }
  };

  protected gameOver = (winnerPlayerId: string, callback?: () => void) => {
    this.players.resetActivePlayer();
    this.winnerId = winnerPlayerId;
    callback?.();
  };

  public changeCardOrder = (cardId: number, targetIndex: number) => {
    this.cards.replaceCards(cardId, targetIndex);
  };
}
