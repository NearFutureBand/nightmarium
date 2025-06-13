import {
  AbilityAxeData,
  AbilityBonesData,
  AbilityDropData,
  AbilitySmileData,
  AbilityTeethData,
  AbilityWolfData,
  ApplyAbilityHandler,
  ApplyAbilityParams
} from './types';
import Monster from 'src/modules/Monster';
import { AbilitiesState } from '../AbilitiesState';
import GameState from 'src/modules/Game/GameState';
import { generateError } from 'src/constants/errors';
import { AbilityName, PrepareNextAbilityResult } from '../types';
import { ABILITY } from '../constants';

export class AbilitiesController extends GameState {
  protected abilities: AbilitiesState | null;
  private applyAbilityMap: Record<AbilityName, (params: any) => void>;

  constructor() {
    super();
    this.abilities = null;
    this.applyAbilityMap = {
      WOLF: ({ cardIds, monsterId }) => this.applyWolfAbility({ cardIds, monsterId }),
      DROP: () => this.applyDropAbility({}),
      SMILE: ({ cardId, monsterId }) => this.applySmileAbility({ cardId, monsterId }),
      AXE: ({ targetMonsterId, targetPlayerId }) =>
        this.applyAxeAbility({ targetMonsterId, targetPlayerId }),
      BONES: ({ targetMonsterId, targetPlayerId }) =>
        this.applyBonesAbility({ targetMonsterId, targetPlayerId }),
      TEETH: ({ targetMonsterId }) => this.applyTeethAbility({ targetMonsterId })
    };
  }

  public startAbilitiesMode = (playerId: string, targetMonster: Monster) => {
    // create class here and assign ability handlers
    this.abilities = new AbilitiesState({
      playerId,
      targetMonster,
      giveCard: this.cards.giveCard
      // stopAbilitiesMode: this.stopAbilitiesMode,
    });
    return this.abilities.prepareNextAbility();
  };

  public stopAbilitiesMode = () => {
    this.abilities = null;

    /** @todo made a callback */
    // const activePlayer = this.getActivePlayer();
    // if (activePlayer.howManyMonstersDone() === this.monstersToWin) {
    //   return this.gameOver(activePlayer.id);
    // }

    // if (this.actions === 0) {
    //   this.setNextActivePlayer();
    // }
  };

  public applyAbility = (params: ApplyAbilityParams): PrepareNextAbilityResult => {
    if (!this.abilities) {
      throw generateError('abilities_mode_is_not_active');
    }
    const ability = this.abilities.getCurrentAbility();
    if (!ability) {
      throw generateError('ability_state_is_null');
    }
    const applyAbilityResult = this.applyAbilityMap[ABILITY[ability.type]](params);
    console.log(applyAbilityResult);
    // applyAbility может вернуть новое сообщение
    // например, при выполнении способности волк/улыбка собирается другой монстр и теперь он должен стать активным
    // if (applyAbilityResult) {
    //   return applyAbilityResult;
    // }

    // // TODO TMP может быть сделать какой-то рефакторинг
    if (params.abilityType === 0 && params.monsterId === undefined && params.cardIds.length === 2) {
      ability.actions -= 2;
    } else {
      ability.actions -= 1;
    }

    // // Одношаговые способности попадают сюда
    if (ability.actions === 0) {
      return this.abilities.prepareNextAbility();
    }

    // Если шаги еще остались, возвращаем стейт текущей способности
    // Подразумевая что стейт способности был изменен одной из applyAbilityMap мутабельно
    return {
      continueAbilities: true,
      ability: this.abilities.serialize()
    };
    // return {
    //   type: MESSAGE_TYPE.AWAIT_ABILITY,
    // }
  };

  private applyWolfAbility: ApplyAbilityHandler<AbilityWolfData> = ({ cardIds, monsterId }) => {
    // const ability = this.abilitiesMode!.getCurrentAbility();
    // const abilityCards = ability.cards!;

    // const findCardIndex = (cardId: number) => {
    //   const cardIndex = abilityCards.findIndex((card) => card.id === cardId);
    //   if (cardIndex < 0) {
    //     throw new Error(`ApplyWolfAbility: card ${cardId} is not found in ability state`);
    //   }
    //   return cardIndex;
    // };

    // // TODO double check with `action_experimental` that it equals to "THROW_OFF"
    // // Если monsterId не передан, значит игрок нажал на кнопку сбросить карту (карты)
    // if (monsterId === undefined) {
    //   cardIds.forEach((cardId) => {
    //     const cardIndex = findCardIndex(cardId);
    //     const [thrownAwayCard] = abilityCards.splice(cardIndex, 1);
    //     this.throwCardAway(thrownAwayCard);
    //   });
    //   return;
    // }

    // const activePlayer = this.getActivePlayer();
    // // установить можно только одну кару за раз, поэтому тут гарантированно нулевой индекс в массиве
    // const cardIndex = findCardIndex(cardIds[0]);

    // const placeCardResult = this.placeCardToMonster({
    //   player: activePlayer,
    //   card: abilityCards[cardIndex],
    //   monsterId
    // });

    // abilityCards.splice(cardIndex, 1);
    // ability.cards = abilityCards;
    // return placeCardResult;
    return {};
  };

  private applyDropAbility: ApplyAbilityHandler<AbilityDropData> = () => {
    const ability = this.abilities?.getCurrentAbility();
    if (!ability) {
      throw generateError('ability_state_is_null');
    }
    const player = this.players.getActivePlayer();
    if (!player) {
      throw generateError('no_active_player');
    }
    if (!ability.cards) {
      throw generateError('no_cards_given_for_drop_ability');
    }
    player.addCards(ability.cards);
    return {};
  };

  private applySmileAbility: ApplyAbilityHandler<AbilitySmileData> = ({ cardId, monsterId }) => {
    const player = this.players.getActivePlayer();
    if (!player) {
      throw generateError('no_active_player');
    }
    // return this.placeCardToMonster({ player: activePlayer, cardId, monsterId });
    return {};
  };

  /**
   * Забрать верхнюю карту чужого монстра на руку
   */
  private applyAxeAbility: ApplyAbilityHandler<AbilityAxeData> = ({
    targetPlayerId,
    targetMonsterId
  }) => {
    const player = this.players.getActivePlayer();
    if (!player) {
      throw generateError('no_active_player');
    }
    const targetPlayer = this.players.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    const removedCard = targetMonster.removeTopBodyPart();
    player.addCard(removedCard);
    return {};
  };

  /**
   * кости, уничтожить недостроенного монстра целиком
   */
  private applyBonesAbility: ApplyAbilityHandler<AbilityBonesData> = ({
    targetPlayerId,
    targetMonsterId
  }) => {
    const targetPlayer = this.players.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    // @todo double check if monster is not built completely

    const removedCards = targetMonster.kill();
    this.cards.throwCardsAway(removedCards);
    return {};
  };

  /**
   * Выбросить верхнюю карту своего монстра, кроме текущего
   */
  private applyTeethAbility: ApplyAbilityHandler<AbilityTeethData> = ({ targetMonsterId }) => {
    const player = this.players.getActivePlayer();
    if (!player) {
      throw generateError('no_active_player');
    }
    const targetMonster = player.getMosterById(targetMonsterId);
    const removedCard = targetMonster.removeTopBodyPart();
    this.cards.throwCardAway(removedCard);
    return {};
  };
}
