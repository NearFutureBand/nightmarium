import Monster from 'src/modules/Monster';
import { AbilityState, AbilityStateSerialized, PrepareNextAbilityResult } from './types';
import { Card } from 'src/types';
import { generateError } from 'src/constants/errors';

type AbilitiesSequence = { abilityType: number; isDone: boolean }[];

export class AbilitiesState {
  private playerId: string;
  private monsterId: number;
  private sequence: AbilitiesSequence;
  private giveCard: () => Card;
  private state: AbilityState | null;
  private index: number;

  constructor({
    playerId,
    targetMonster,
    giveCard
  }: {
    playerId: string;
    targetMonster: Monster;
    giveCard: () => Card;
  }) {
    const sequence = [...targetMonster.body]
      .reverse()
      .filter((bodypart) => bodypart.ability !== null)
      .map((bodypart) => ({ abilityType: bodypart.ability as number, isDone: false }));
    this.playerId = playerId;
    this.monsterId = targetMonster.id;
    this.sequence = sequence;
    this.index = -1;
    this.giveCard = giveCard;
    this.state = null;
  }

  public getCurrentAbility = () => {
    return this.state;
  };

  /** Does plus one to the index and prepares and
   * returns the state of the next ability if there is one. If no
   * abilities left returns the noAbilitiesLeft flag
   */
  public prepareNextAbility = (): PrepareNextAbilityResult => {
    this.index += 1;
    if (!this.sequence[this.index]) {
      return {
        noAbilitiesLeft: true
      };
    }
    this.updateAbilityState();
    return {
      continueAbilities: true,
      ability: this.serialize()
    };
  };

  public serialize = (): AbilityStateSerialized => {
    if (this.state === null) {
      throw generateError('ability_state_is_null');
    }
    return {
      abilityNumber: this.state.index,
      abilityType: this.state.type,
      actions: this.state.actions,
      cards: this.state.cards,
      monsterId: this.monsterId
    };
  };

  private updateAbilityState = () => {
    if (this.index === null) {
      throw generateError('index_of_abilities_is_null');
    }
    const abilityType = this.sequence[this.index].abilityType;
    this.state = {
      index: this.index,
      actions: this.getActionsNumberByAbilityType(abilityType),
      type: abilityType,
      cards: [this.giveCard(), this.giveCard()]
    };
  };

  private getActionsNumberByAbilityType = (abilityType: number | null) => {
    if (abilityType === 0) return 2;
    return 1;
  };

  /** set next index and call onAbility */
  // public setNextAbility = () => {
  //   const ability = this.currentAbilityState;
  //   const nextIndex = ability.index + 1;

  //   if (nextIndex === 3) {
  //     this.stopAbilitiesMode();
  //     return;
  //   }

  //   const nextAbilityType = this.sequence[nextIndex];
  //   this.currentAbilityState = {
  //     type: nextAbilityType,
  //     index: nextIndex,
  //     done: false,
  //     inprogress: false,
  //     actions: this.getActionsNumberByAbilityType(nextAbilityType)
  //   };

  //   // return this.onAbility();
  // };

  /** packAbility ?
   * prepareAbilityArtifacts ?
   * completeAbility ?
   */
  // onAbility = (): {
  //   noAbilitiesLeft?: boolean;
  //   continueAbilities?: boolean;
  //   ability?: AbilityStateSerialized;
  // } => {
  //   if (!this.index === null || this.index === this.sequence.length) {
  //     return { noAbilitiesLeft: true };
  //   }

  //   this.updateAbilityState();
  //   // const ability = this.state as NonNullable<AbilityState>;

  //   // if (ability.type === null) {
  //   //   console.log('no ability');
  //   //   return this.setNextAbility();
  //   // }

  //   // const messagePayload: AbilityMessagePayload = {
  //   //   abilityNumber: ability.index,
  //   //   abilityType: ability.type,
  //   //   actions: ability.actions,
  //   //   monsterId: this.monsterId
  //   // };

  //   // if (ability.type <= 1) {
  //   //   // карты выдаются для способностей волк (0) и капля (1)
  //   //   const cards = [this.giveCard(), this.giveCard()];
  //   //   ability.cards = cards;
  //   //   messagePayload.cards = cards;
  //   // }

  //   // return {
  //   //   type: 'AWAIT_ABILITY',
  //   //   ability: messagePayload
  //   // } as Message<{
  //   //   ability: AbilityMessagePayload;
  //   // }>;
  //   return {
  //     continueAbilities: true,
  //     ability: this.serialize()
  //   };
  // };
}
