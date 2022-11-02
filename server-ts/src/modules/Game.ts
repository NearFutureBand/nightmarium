import { CARDS } from './Cards';
import { randomInteger } from '../helpers';
import { sortBy } from 'lodash';
import {
  AbilityAxeData,
  AbilityBonesData,
  AbilityDropData,
  AbilitySmileData,
  AbilityTeethData,
  AbilityWolfData,
  ApplyAbilityHandler,
  ApplyAbilityParams,
  Card,
  CardsDatabase,
  GameState,
  Legion,
  PlayerState,
  PutCardReturnType,
} from '../types';
import Player from './Player';
import { ABILITIES, GAME_ACTIONS, MESSAGE_TYPE } from '../constants';
import Monster from './Monster';
import { AbilitiesMode, ApplyAbilityMap, LegionMode } from './Modes';
import Logger from './Logger';

export default class Game {
  public id: string;
  private cardsAvailable: CardsDatabase;
  private cardsThrownAway: CardsDatabase;
  private _players: Player[];
  private activePlayerIndex: number | null;
  private actions: number;
  private lastAction: string | null;
  private idMap: { [playerId: string]: number }; // playerId -> индекс игрока в массиве _players
  public abilitiesMode: AbilitiesMode | null;
  public legionMode: LegionMode | null;
  public winnerId?: string;

  // игровые настройки
  private monstersToWin: number;

  private applyAbilityMap: ApplyAbilityMap;

  constructor(id: string) {
    this.id = id;
    this.cardsAvailable = CARDS;
    this.cardsThrownAway = {};
    this._players = [];
    this.activePlayerIndex = null;
    this.actions = 0;
    this.lastAction = null;
    this.idMap = {};
    this.abilitiesMode = null;
    this.legionMode = null;
    this.winnerId = undefined;
    this.monstersToWin = 5;

    this.applyAbilityMap = {
      [ABILITIES.WOLF]: ({ cardIds, monsterId }) => this.applyWolfAbility({ cardIds, monsterId }),
      [ABILITIES.DROP]: () => this.applyDropAbility({}),
      [ABILITIES.SMILE]: ({ cardId, monsterId }) => this.applySmileAbility({ cardId, monsterId }),
      [ABILITIES.AXE]: ({ targetMonsterId, targetPlayerId }) => this.applyAxeAbility({ targetMonsterId, targetPlayerId }),
      [ABILITIES.BONES]: ({ targetMonsterId, targetPlayerId }) => this.applyBonesAbility({ targetMonsterId, targetPlayerId }),
      [ABILITIES.TEETH]: ({ targetMonsterId }) => this.applyTeethAbility({ targetMonsterId }),
    };
  }

  giveDefaulCards = (): Card[] => {
    return new Array(6).fill(null).map(() => {
      return this.giveCard();
    });
  };

  giveCard = () => {
    let availableIndices = Object.keys(this.cardsAvailable);
    if (availableIndices.length === 0) {
      this.cardsAvailable = { ...this.cardsThrownAway };
      this.cardsThrownAway = {};
      availableIndices = Object.keys(this.cardsAvailable);
    }
    const cardIndex = availableIndices[randomInteger(0, availableIndices.length - 1)];
    const card: Card = { ...this.cardsAvailable[cardIndex] };
    delete this.cardsAvailable[cardIndex];
    return card;
  };

  addPlayer = (player: Player) => {
    const playersArrayLength = this._players.push(player);
    this.idMap[player.id] = playersArrayLength - 1;
    console.log(this.idMap);
  };

  removePlayer = (playerId: string) => {
    const playerIndex = this.idMap[playerId];
    this._players.splice(playerIndex, 1);
    this.reMapPlayers();
  };

  resetPlayer = (playerId: string) => {
    this.getPlayerById(playerId).reset();
  };

  private reMapPlayers = () => {
    this.idMap = {};
    this._players.forEach((player, index) => {
      this.idMap[player.id] = index;
    });
    console.log(this.idMap);
  };

  public get players() {
    return this._players;
  }

  public isGameStarted = () => {
    return this.activePlayerIndex !== null;
  };

  // TODO refactor
  public getGameState = (requestPlayerId?: string): GameState => {
    let activePlayer: PlayerState<number> | undefined = undefined;
    try {
      activePlayer = this.getActivePlayer()?.getPlayerState() as PlayerState<number>;
    } catch (error: any) {
      console.log('ERROR: ', error.message);
    }

    return {
      id: this.id,
      activePlayer,
      me: requestPlayerId ? (this.getPlayerById(requestPlayerId)?.getPlayerState(true) as PlayerState<Card[]>) : undefined,
      otherPlayers: sortBy(
        this.players.filter((player) => player.id !== requestPlayerId).map((player) => player.getPlayerState() as PlayerState<number>),
        'id'
      ),
      actions: this.actions,
      lastAction: this.lastAction,
      winnerId: this.winnerId,
    };
  };

  setNextActivePlayer() {
    if (!this.activePlayerIndex) {
      this.activePlayerIndex = 0;
    }
    this.activePlayerIndex = this.activePlayerIndex === this.players.length - 1 ? 0 : this.activePlayerIndex + 1;
    this.actions = 2;
    this.lastAction = null;
  }

  getActivePlayer = () => {
    if (this.activePlayerIndex !== 0 && !this.activePlayerIndex) throw new Error('No active player');
    return this._players[this.activePlayerIndex];
  };

  getPlayerById = (id: string): Player => {
    return this._players[this.idMap[id]];
  };

  activePlayerTakesCard = () => {
    const activePlayer = this.getActivePlayer();
    const card = this.giveCard();
    activePlayer?.addCard(card);
    // TODO может быть объединить lastAction и minusAction ? ( следующие две строчки )
    this.lastAction = GAME_ACTIONS.TAKE_CARD;
    this.minusAction();
  };

  activePlayerPutsCard = (cardId: number, monsterId: number): PutCardReturnType => {
    const activePlayer = this.getActivePlayer();

    // TODO for endgame test purposes
    // return this.gameOver(activePlayer.id);

    // TODO test it and put this function to the smile and wolf ability handler
    // TODO combine this bit with actions decrement more clear
    const placeCardResult = this.placeCardToMonster({
      player: activePlayer,
      cardId,
      monsterId,
    });

    this.actions -= 1;
    if (this.actions === 0 && !placeCardResult) {
      this.setNextActivePlayer();
      return;
    }

    return placeCardResult;
  };

  getOtherPlayers = (playerId: string) => {
    return this._players.filter((player) => player.id !== playerId);
  };

  placeCardToMonster = ({ player, cardId, monsterId, card }: { player: Player; cardId?: number; monsterId: number; card?: Card }): PutCardReturnType => {
    const targetMonster = card ? player.placeCardToMonster(card, monsterId) : player.placeCardFromHandToMonster(cardId!, monsterId);
    // Не запоминать последний ход, если находимся в режиме способности
    if (!this.abilitiesMode) {
      this.lastAction = GAME_ACTIONS.PLAY_CARD(targetMonster.body[targetMonster.body.length - 1].legion);
    }

    if (targetMonster.isDone()) {
      console.log('monster is done', targetMonster.getBody());
      const monstersDone = player.howManyMonstersDone();
      const monsterHasTeethAbility = targetMonster.hasTeethAbility();

      // ПОБЕДА одного из игроков
      if (monstersDone === this.monstersToWin && !monsterHasTeethAbility) {
        return this.gameOver(player.id);
      }

      const monsterLegion = targetMonster.isOfSameColor();
      // Собран монстр одного цвета
      if (monsterLegion && this.players.length > 1) {
        this.startLegionMode(player.id, targetMonster.id, monsterLegion);
        return {
          type: MESSAGE_TYPE.AWAIT_LEGION_CARD,
          legion: this.legionMode!.getLegionModeState(),
        };
      }

      this.startAbilitiesMode(player.id, targetMonster);
      return this.abilitiesMode!.onAbility();
    }
  };

  private gameOver = (playerId: string) => {
    // TODO очистить все состояния ( перепроверить)
    this.activePlayerIndex = null;
    this.winnerId = playerId;
    this.stopLegionMode();
    this.abilitiesMode = null;

    return {
      type: MESSAGE_TYPE.GAME_OVER,
    };
  };

  forEachPlayer = (callback: (player: Player, index: number) => void) => {
    this._players.forEach(callback);
  };

  minusAction = () => {
    this.actions -= 1;
    if (this.actions === 0) {
      this.setNextActivePlayer();
    }
  };

  throwCardAway = (card: Card) => {
    this.cardsThrownAway[card.id] = card;
  };

  throwCardsAway = (cards: Card[]) => {
    cards.forEach((card) => this.throwCardAway(card));
  };

  activePlayerExchangesCards = (cardIds: number[]): void => {
    const activePlayer = this.getActivePlayer();
    const removedCards = activePlayer.removeCardsFromHand(cardIds);
    this.throwCardsAway(removedCards);
    activePlayer.addCards(new Array(Math.floor(cardIds.length / 2)).fill(null).map(() => this.giveCard()));
    this.lastAction = GAME_ACTIONS.CHANGE_CARDS;
    this.minusAction();
  };

  //
  // Abilities mode methods

  startAbilitiesMode = (playerId: string, targetMonster: Monster) => {
    // create class here and assign ability handlers
    this.abilitiesMode = new AbilitiesMode({
      playerId,
      targetMonster,
      giveCard: this.giveCard,
      stopAbilitiesMode: this.stopAbilitiesMode,
      applyAbilityMap: this.applyAbilityMap,
    });
    console.log('started ability mode');
    Logger.log('ABILITY MODE STARTED', this.abilitiesMode);
  };

  stopAbilitiesMode = () => {
    this.abilitiesMode = null;

    const activePlayer = this.getActivePlayer();
    if (activePlayer.howManyMonstersDone() === this.monstersToWin) {
      return this.gameOver(activePlayer.id);
    }

    if (this.actions === 0) {
      this.setNextActivePlayer();
    }
  };

  applyAbility = (params: ApplyAbilityParams): PutCardReturnType => {
    return this.abilitiesMode!.applyAbility(params);
  };

  //
  // Apply concrete abilities

  applyWolfAbility: ApplyAbilityHandler<AbilityWolfData> = ({ cardIds, monsterId }) => {
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
      monsterId,
    });

    abilityCards.splice(cardIndex, 1);
    ability.cards = abilityCards;
    return placeCardResult;
  };

  applyDropAbility: ApplyAbilityHandler<AbilityDropData> = () => {
    const ability = this.abilitiesMode!.getCurrentAbility()!;
    const player = this.getActivePlayer();
    // cards здесь определены точно, так как это применение способности и в стейте эти карты уже есть
    player.addCards(ability.cards!);
  };

  applySmileAbility: ApplyAbilityHandler<AbilitySmileData> = ({ cardId, monsterId }) => {
    const activePlayer = this.getActivePlayer();
    return this.placeCardToMonster({ player: activePlayer, cardId, monsterId });
  };

  /**
   * Забрать верхнюю карту чужого монстра на руку
   */
  applyAxeAbility: ApplyAbilityHandler<AbilityAxeData> = ({ targetPlayerId, targetMonsterId }) => {
    const player = this.getActivePlayer();
    const targetPlayer = this.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    const removedCard = targetMonster.removeTopBodyPart();
    player.addCard(removedCard);
  };

  /**
   * кости, уничтожить недостроенного монстра целиком
   */
  applyBonesAbility: ApplyAbilityHandler<AbilityBonesData> = ({ targetPlayerId, targetMonsterId }) => {
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
  applyTeethAbility: ApplyAbilityHandler<AbilityTeethData> = ({ targetMonsterId }) => {
    const player = this.getActivePlayer();
    const targetMonster = player.getMosterById(targetMonsterId);
    const removedCard = targetMonster.removeTopBodyPart();
    this.throwCardAway(removedCard);
  };

  //
  //
  // Legion mode methods
  startLegionMode = (playerId: string, monsterId: number, legion: Legion) => {
    this.legionMode = new LegionMode({
      playerId,
      monsterId,
      otherPlayers: this.getOtherPlayers(playerId),
      legion,
    });
    console.log('started legion mode: ', legion, this.legionMode);
  };

  stopLegionMode = () => {
    this.legionMode = null;
  };

  playerThrowsLegionCard = (playerId: string, cardIds: number[]) => {
    const player = this.getPlayerById(playerId);
    const cards = cardIds.map((cardId) => player.findCardOnHandById(cardId));

    this.legionMode?.acceptAndCheckPlayerCard(playerId, cards);
    const removedCards = player.removeCardsFromHand(cardIds);
    this.throwCardsAway(removedCards);

    // If all responded correctly - launch abilityMode
    if (this.legionMode!.areAllPlayersResponded()) {
      const activePlayer = this.getActivePlayer();
      // activePlayer.id should be equal to this.legionMode!.playerId
      this.startAbilitiesMode(activePlayer.id, activePlayer.getMosterById(this.legionMode!.monsterId));
      this.stopLegionMode();
      return this.abilitiesMode!.onAbility();
    }

    return {
      type: MESSAGE_TYPE.AWAIT_LEGION_CARD,
      legion: this.legionMode!.getLegionModeState(),
    };
  };
}
