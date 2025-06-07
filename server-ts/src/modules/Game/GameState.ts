import { Card } from 'src/types';
import Player from 'src/modules/Player';
import GamePlayers from './GamePlayers';
import GameCards from './GameCards';
import { AbilitiesMode } from './Abilities/AbilitiesMode';
import { LegionMode } from '../Modes';

export default class GameState {
  public id: string;
  protected actions: number;
  protected lastAction: string | null;
  protected winnerId: string | null;

  protected players: GamePlayers;
  protected cards: GameCards;

  protected abilitiesMode: AbilitiesMode | null;
  protected legionMode: LegionMode | null;

  // игровые настройки
  private monstersToWin: number;

  // private applyAbilityMap: ApplyAbilityMap;

  constructor() {
    this.id = crypto.randomUUID();
    this.actions = 0;
    this.lastAction = null;
    this.winnerId = null;

    this.players = new GamePlayers();
    this.cards = new GameCards();

    this.abilitiesMode = null;
    this.legionMode = null;

    this.monstersToWin = 5;
  }

  protected minusAction = (lastAction?: string) => {
    if (lastAction !== undefined) {
      this.lastAction = lastAction;
    }
    this.actions -= 1;
    if (this.actions <= 0) {
      this.players.setNextActivePlayer(() => {
        this.actions = 2;
        this.lastAction = null;
      });
    }
  };
}
