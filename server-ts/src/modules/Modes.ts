import { ABILITIES, MESSAGE_TYPE } from '../constants';
import {
  AbilityMessagePayload,
  AbiltityMessageOrUndefined,
  ApplyAbilityParams,
  Card,
  Legion,
  LegionMessagePayload,
  LegionPlayerState,
  PutCardReturnType,
} from '../types';
import Monster from './Monster';
import Player from './Player';

export type ApplyAbilityMap = {
  [key: number]: (params: ApplyAbilityParams) => PutCardReturnType | void;
};

export type AbilityState = {
  type: number | null;
  index: number; // Индекс способности в монстре ( 0 - 3 )
  done: boolean; // Выполнена способность или нет - в целом пока бесполезно
  inprogress: boolean;
  actions: number; // Сколько действий осталось внутри этой способности, нужно для сложных сп. таких как Волк
  cards?: Card[]; // Карты, выдаваемые внутри способности. Будут храниться здесь, чтобы оперировать только индексами карт
};

export class AbilitiesMode {
  playerId: string;
  monsterId: number;
  sequence: (number | null)[];
  currentAbilityState: AbilityState;
  giveCard: () => Card;
  stopAbilitiesMode: () => void;
  private applyAbilityMap: ApplyAbilityMap;

  constructor({
    playerId,
    targetMonster,
    giveCard,
    stopAbilitiesMode,
    applyAbilityMap,
  }: {
    playerId: string;
    targetMonster: Monster;
    giveCard: () => Card;
    stopAbilitiesMode: () => void;
    applyAbilityMap: ApplyAbilityMap;
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
      actions: this.getActionsNumberByAbilityType(sequence[0]),
    };
    this.giveCard = giveCard;
    this.stopAbilitiesMode = stopAbilitiesMode;
    this.applyAbilityMap = applyAbilityMap;
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
      actions: this.getActionsNumberByAbilityType(nextAbilityType),
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
    };

    if (ability.type <= 1) {
      // карты выдаются для способностей волк (0) и капля (1)
      const cards = [this.giveCard(), this.giveCard()];
      ability.cards = cards;
      messagePayload.cards = cards;
    }
    return {
      type: MESSAGE_TYPE.AWAIT_ABILITY,
      ability: messagePayload,
    };
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
    if (params.abilityType === ABILITIES.WOLF && params.monsterId === undefined && params.cardIds.length === 2) {
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
      },
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
    };
  };
}

export class LegionMode {
  playerId: string;
  monsterId: number;
  otherPlayersResponses: { [playerId: string]: LegionPlayerState }; // Здесь должны быть остальные игроки
  currentLegion: Legion;

  constructor({ playerId, monsterId, otherPlayers, legion }: { playerId: string; monsterId: number; otherPlayers: Player[]; legion: Legion }) {
    this.playerId = playerId;
    this.monsterId = monsterId;
    this.otherPlayersResponses = otherPlayers.reduce((result, player) => {
      const howManyCardsHas = player.howManyCards();
      return {
        ...result,
        [player.id]: {
          playerId: player.id,
          howManyCardsHas,
          respondedCorrectly: howManyCardsHas === 0,
          gaveCards: 0,
        },
      };
    }, {} as { [playerId: string]: LegionPlayerState });
    this.currentLegion = legion;
  }

  getLegionModeState = (): LegionMessagePayload => {
    return {
      legion: this.currentLegion,
      players: this.otherPlayersResponses,
    };
  };

  acceptAndCheckPlayerCard = (playerId: string, cards: Card[]) => {
    const playerState = this.otherPlayersResponses[playerId];

    // если у игрока была всего одна карта, то она засчитывается
    if (playerState?.howManyCardsHas === 1) {
      playerState.respondedCorrectly = true;
      playerState.gaveCards = 1;
      return;
    }

    // Одна карта прислана + ожидаем что она подходящего легиона
    if (cards.length === 1 && cards[0].legion === this.currentLegion) {
      playerState.respondedCorrectly = true;
    }

    // Пришла еще одна карта, когда уже была сброшена одна - итого две и ответ засчитан
    if (cards.length === 1 && playerState.gaveCards === 1) {
      playerState.respondedCorrectly = true;
    }

    // Две карты сразу - засчитываем
    if (cards.length === 2) {
      playerState.respondedCorrectly = true;
    }

    playerState.gaveCards = cards.length;
  };

  areAllPlayersResponded = () => {
    for (const playerId in this.otherPlayersResponses) {
      if (!this.otherPlayersResponses[playerId].respondedCorrectly) return false;
    }
    return true;
  };
}
