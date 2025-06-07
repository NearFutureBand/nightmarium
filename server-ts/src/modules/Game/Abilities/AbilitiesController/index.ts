import { ABILITIES } from 'src/constants';
import { ApplyAbilityHandler } from 'src/types';
import { AbilitiesMode } from 'src/types';
import {
  AbilityAxeData,
  AbilityBonesData,
  AbilityDropData,
  AbilitySmileData,
  AbilityTeethData,
  AbilityWolfData
} from './types';

export default class AbilitiesController {
  public abilities: AbilitiesMode | null;
  private applyAbilityMap: Record<ABILITIES, (params: any) => void>;

  constructor() {
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

  private applyWolfAbility: ApplyAbilityHandler<AbilityWolfData> = ({ cardIds, monsterId }) => {
    const ability = this.abilitiesMode!.getCurrentAbility();
    const abilityCards = ability.cards!;

    const findCardIndex = (cardId: number) => {
      const cardIndex = abilityCards.findIndex((card) => card.id === cardId);
      if (cardIndex < 0) {
        throw new Error(`ApplyWolfAbility: card ${cardId} is not found in ability state`);
      }
      return cardIndex;
    };

    // TODO double check with `action_experimental` that it equals to "THROW_OFF"
    // Если monsterId не передан, значит игрок нажал на кнопку сбросить карту (карты)
    if (monsterId === undefined) {
      cardIds.forEach((cardId) => {
        const cardIndex = findCardIndex(cardId);
        const [thrownAwayCard] = abilityCards.splice(cardIndex, 1);
        this.throwCardAway(thrownAwayCard);
      });
      return;
    }

    const activePlayer = this.getActivePlayer();
    // установить можно только одну кару за раз, поэтому тут гарантированно нулевой индекс в массиве
    const cardIndex = findCardIndex(cardIds[0]);

    const placeCardResult = this.placeCardToMonster({
      player: activePlayer,
      card: abilityCards[cardIndex],
      monsterId
    });

    abilityCards.splice(cardIndex, 1);
    ability.cards = abilityCards;
    return placeCardResult;
  };

  private applyDropAbility: ApplyAbilityHandler<AbilityDropData> = () => {
    const ability = this.abilitiesMode!.getCurrentAbility()!;
    const player = this.getActivePlayer();
    // cards здесь определены точно, так как это применение способности и в стейте эти карты уже есть
    player.addCards(ability.cards!);
  };

  private applySmileAbility: ApplyAbilityHandler<AbilitySmileData> = ({ cardId, monsterId }) => {
    const activePlayer = this.getActivePlayer();
    return this.placeCardToMonster({ player: activePlayer, cardId, monsterId });
  };

  /**
   * Забрать верхнюю карту чужого монстра на руку
   */
  private applyAxeAbility: ApplyAbilityHandler<AbilityAxeData> = ({
    targetPlayerId,
    targetMonsterId
  }) => {
    const player = this.getActivePlayer();
    const targetPlayer = this.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    const removedCard = targetMonster.removeTopBodyPart();
    player.addCard(removedCard);
  };

  /**
   * кости, уничтожить недостроенного монстра целиком
   */
  private applyBonesAbility: ApplyAbilityHandler<AbilityBonesData> = ({
    targetPlayerId,
    targetMonsterId
  }) => {
    const targetPlayer = this.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    // проверка действительно ли монстр завершен ( но это также будет првоерено и на фронте)

    // TODO реально ли это объединить в один метод, чтобы сразу карты убитого монстра попадали в cardsThrownAway
    const removedCards = targetMonster.kill();
    this.throwCardsAway(removedCards);
  };

  /**
   * Выбросить верхнюю карту своего монстра, кроме текущего
   */
  private applyTeethAbility: ApplyAbilityHandler<AbilityTeethData> = ({ targetMonsterId }) => {
    const player = this.getActivePlayer();
    const targetMonster = player.getMosterById(targetMonsterId);
    const removedCard = targetMonster.removeTopBodyPart();
    this.throwCardAway(removedCard);
  };
}
