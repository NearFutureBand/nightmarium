import { AbilityState, ApplyAbilityParams, Card, PutCardReturnType } from 'src/types';
import Monster from 'src/modules/Monster';

export type ApplyAbilityMap = {
  [key: number]: (params: ApplyAbilityParams) => PutCardReturnType | void;
};

export class AbilitiesMode {
  private playerId: string;
  private monsterId: number;
  private sequence: (number | null)[];
  private currentAbilityState: AbilityState;

  giveCard: () => Card;
  stopAbilitiesMode: () => void;

  // private applyAbilityMap: ApplyAbilityMap;

  constructor({
    playerId,
    targetMonster,
    giveCard,
    stopAbilitiesMode
  }: // applyAbilityMap
  {
    playerId: string;
    targetMonster: Monster;
    giveCard: () => Card;
    stopAbilitiesMode: () => void;
    // applyAbilityMap: ApplyAbilityMap;
  }) {
    const sequence = [...targetMonster.body].reverse().map((bodypart) => bodypart.ability);

    this.playerId = playerId;
    this.monsterId = targetMonster.id;
    this.sequence = sequence;
    this.currentAbilityState = {
      type: sequence[0],
      index: 0,
      done: false,
      inprogress: false,
      actions: this.getActionsNumberByAbilityType(sequence[0])
    };
    this.giveCard = giveCard;
    this.stopAbilitiesMode = stopAbilitiesMode;
    // this.applyAbilityMap = applyAbilityMap;
  }

  getCurrentAbility = () => {
    return this.currentAbilityState;
  };

  setNextAbility = (): AbiltityMessageOrUndefined => {
    const ability = this.currentAbilityState;
    const nextIndex = ability.index + 1;

    if (nextIndex === 3) {
      this.stopAbilitiesMode();
      return;
    }

    const nextAbilityType = this.sequence[nextIndex];
    this.currentAbilityState = {
      type: nextAbilityType,
      index: nextIndex,
      done: false,
      inprogress: false,
      actions: this.getActionsNumberByAbilityType(nextAbilityType)
    };

    return this.onAbility();
  };

  onAbility = (): AbiltityMessageOrUndefined => {
    /** If abilitiesMode doesn't exist the error will be thrown
     * So this.abilitiesState! can be used further
     */
    const ability = this.currentAbilityState;
    console.log('current ability: ', ability);

    if (ability.type === null) {
      console.log('no ability');
      return this.setNextAbility();
    }

    ability.inprogress = true;

    const messagePayload: AbilityMessagePayload = {
      abilityNumber: ability.index,
      abilityType: ability.type,
      actions: ability.actions,
      monsterId: this.monsterId
    };

    if (ability.type <= 1) {
      // карты выдаются для способностей волк (0) и капля (1)
      const cards = [this.giveCard(), this.giveCard()];
      ability.cards = cards;
      messagePayload.cards = cards;
    }
    return {
      type: 'AWAIT_ABILITY',
      ability: messagePayload
    } as Message<{
      ability: AbilityMessagePayload;
    }>;
  };

  applyAbility = (params: ApplyAbilityParams): PutCardReturnType => {
    // currentAbility не может быть null здесь, так как карточки без способностей скипаются в onAbility
    const ability = this.currentAbilityState;

    // ability.type не может быть null здесь, т.к. applyAbility обрабатывает ответ с фронта, а фронт выполняет только существующие способности
    /** способности применяются здесь! */
    const applyAbilityResult = this.applyAbilityMap[ability.type!](params);

    // applyAbility может вернуть новое сообщение
    // например, при выполнении способности волк/улыбка собирается другой монстр и теперь он должен стать активным
    if (applyAbilityResult) {
      return applyAbilityResult;
    }

    // TODO TMP может быть сделать какой-то рефакторинг
    if (
      params.abilityType === ABILITIES.WOLF &&
      params.monsterId === undefined &&
      params.cardIds.length === 2
    ) {
      ability.actions -= 2;
    } else {
      ability.actions -= 1;
    }

    // Одношаговые способности попадают сюда
    if (ability.actions === 0) {
      ability.done = true;
      ability.inprogress = false;

      return this.setNextAbility();
    }

    // Если шаги еще остались, возвращаем стейт текущей способности
    // Подразумевая что стейт способности был изменен одной из applyAbilityMap мутабельно
    return {
      type: MESSAGE_TYPE.AWAIT_ABILITY,
      ability: {
        cards: ability.cards,
        abilityNumber: ability.index,
        abilityType: ability.type!,
        actions: ability.actions,
        monsterId: this.monsterId
      }
    };
  };

  private getActionsNumberByAbilityType = (abilityType: number | null) => {
    if (abilityType === 0) return 2;
    return 1;
  };

  public getMessagePayloadFromCurrentState = (): AbilityMessagePayload => {
    // Abiltiy type can not be null here because the class doesn't store
    // ability state if it's null. All the null abilities are always skipped
    return {
      abilityNumber: this.currentAbilityState.index,
      abilityType: this.currentAbilityState.type!,
      actions: this.currentAbilityState.actions,
      cards: this.currentAbilityState.cards,
      monsterId: this.monsterId
    };
  };
}
