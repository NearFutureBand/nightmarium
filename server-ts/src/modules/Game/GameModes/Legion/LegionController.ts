import Player from 'src/modules/Player';
import LegionState from './LegionState';
import { Legion } from './types';
import WithAbilitiesMode from '../Abilities';

export class LegionModeController extends WithAbilitiesMode {
  protected legionState: LegionState | null;

  constructor() {
    super();
    this.legionState = null;
  }

  protected startLegionMode = ({
    playerId,
    monsterId,
    legion,
    otherPlayers
  }: {
    playerId: string;
    monsterId: number;
    legion: Legion;
    otherPlayers: Player[];
  }) => {
    this.legionState = new LegionState({
      playerId,
      monsterId,
      otherPlayers,
      legion
    });
  };

  protected stopLegionMode = () => {
    this.legionState = null;
  };
}
