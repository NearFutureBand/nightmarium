import { CARDS } from './Cards';
import { randomInteger } from '../helpers';
import { sortBy } from 'lodash';
import {
  AbilityMessagePayload,
  ApplyAbilityHandler,
  ApplyAbilityParams,
  Card,
  CardsDatabase,
  GameState,
  Legion,
  Message,
  PlayerState,
  PossibleServerResponseMessage,
  PutCardReturnType,
} from '../types';
import Player from './Player';
import { ABILITIES, MESSAGE_TYPE } from '../constants';
import Monster from './Monster';
import { AbilitiesMode, ApplyAbilityMap, LegionMode } from './Modes';

export default class Game {
  private cardsAvailable: CardsDatabase;
  private cardsThrowedAway: CardsDatabase;
  private _players: Player[];
  private activePlayerIndex: number | null;
  private actions: number;
  private idMap: { [playerId: string]: number }; // playerId -> index of player in players array
  public abilitiesMode: AbilitiesMode | null;
  public legionMode: LegionMode | null;

  private applyAbilityMap: ApplyAbilityMap;

  constructor() {
    this.cardsAvailable = CARDS;
    this.cardsThrowedAway = {};
    this._players = [];
    this.activePlayerIndex = null;
    this.actions = 0;
    this.idMap = {};
    this.abilitiesMode = null;
    this.legionMode = null;

    this.applyAbilityMap = {
      [ABILITIES.WOLF]: ({ cardId, monsterId }) =>
        this.applyWolfAbility({ cardId, monsterId }),
      [ABILITIES.DROP]: () => this.applyDropAbility({}),
      [ABILITIES.SMILE]: ({ cardId, monsterId }) =>
        this.applySmileAbility({ cardId, monsterId }),
      [ABILITIES.AXE]: (params) =>
        this.applyAxeAbility({
          targetMonsterId: params.monsterId,
          targetPlayerId: params.playerId,
        }),
      [ABILITIES.BONES]: (params) =>
        this.applyBonesAbility({
          targetMonsterId: params.monsterId,
          targetPlayerId: params.playerId,
        }),
      [ABILITIES.TEETH]: (params) =>
        this.applyTeethAbility({ targetMonsterId: params.monsterId }),
    };
  }

  giveDefaulCards = (): Card[] => {
    return new Array(6).fill(null).map(() => {
      return this.giveCard();
    });
  };

  giveCard = () => {
    const availableIndices = Object.keys(this.cardsAvailable);
    // if (availableIndices.length === 0) {
    //   return;
    // } // TODO check this case later
    const cardIndex =
      availableIndices[randomInteger(0, availableIndices.length - 1)];
    const card: Card = { ...this.cardsAvailable[cardIndex] };
    delete this.cardsAvailable[cardIndex];
    return card;
  };

  addPlayer = (player: Player) => {
    const playersArrayLength = this._players.push(player);
    this.idMap[player.id] = playersArrayLength - 1;
    console.log(this.idMap);
  };

  public get players() {
    return this._players;
  }

  public getGameState = (requestPlayerId?: string): GameState => {
    let activePlayer: PlayerState<number> | undefined = undefined;
    try {
      activePlayer =
        this.getActivePlayer()?.getPlayerState() as PlayerState<number>;
    } catch (error: any) {
      console.log('ERROR: ', error.message);
    }

    return {
      cardsThrowedAway: this.cardsThrowedAway,
      activePlayer,
      me: requestPlayerId
        ? (this.getPlayerById(requestPlayerId).getPlayerState(
            true
          ) as PlayerState<Card[]>)
        : undefined,
      otherPlayers: sortBy(
        this.players
          .filter((player) => player.id !== requestPlayerId)
          .map((player) => player.getPlayerState() as PlayerState<number>),
        'id'
      ),
      actions: this.actions,
    };
  };

  setNextActivePlayer() {
    if (!this.activePlayerIndex) {
      this.activePlayerIndex = 0;
    }
    this.activePlayerIndex =
      this.activePlayerIndex === this.players.length - 1
        ? 0
        : this.activePlayerIndex + 1;
    this.actions = 2;
  }

  getActivePlayer = () => {
    if (this.activePlayerIndex !== 0 && !this.activePlayerIndex)
      throw new Error('No active player');
    return this._players[this.activePlayerIndex];
  };

  getPlayerById = (id: string): Player => {
    return this._players[this.idMap[id]];
  };

  activePlayerTakesCard = () => {
    const activePlayer = this.getActivePlayer();
    const card = this.giveCard();
    activePlayer?.addCard(card);
    this.minusAction();
  };

  activePlayerPutsCard = (
    cardId: number,
    monsterId: number
  ): PutCardReturnType => {
    const activePlayer = this.getActivePlayer();
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

  /**
   * @param param0
   * @returns Message GAME_OVER | Message AWAIT_LEGION_CARD | PossibleServerResponseMessage | undefined
   */
  placeCardToMonster = ({
    player,
    cardId,
    monsterId,
    card,
  }: {
    player: Player;
    cardId?: number;
    monsterId: number;
    card?: Card;
  }): PutCardReturnType => {
    const targetMonster = card
      ? player.placeCardToMonster(card, monsterId)
      : player.placeCardFromHandToMonster(cardId!, monsterId);

    if (targetMonster.isDone()) {
      console.log('monster is done', targetMonster.getBody());
      const monstersDone = player.howManyMonstersDone();
      const monsterHasTeethAbility = targetMonster.hasTeethAbility();

      // VICTORY case
      if (monstersDone === 5 && !monsterHasTeethAbility) {
        return {
          type: MESSAGE_TYPE.GAME_OVER,
          winner: player.id,
        };
      }

      const monsterLegion = targetMonster.isOfSameColor();
      // Monster of one color case
      if (monsterLegion) {
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

  forEachPlayer = (callback: (player: Player, index: number) => void) => {
    this._players.forEach(callback);
  };

  minusAction = () => {
    this.actions -= 1;
    if (this.actions === 0) {
      this.setNextActivePlayer();
    }
  };

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
  };

  stopAbilitiesMode = () => {
    this.abilitiesMode = null;

    if (this.actions === 0) {
      this.setNextActivePlayer();
    }
  };

  applyAbility = (params: ApplyAbilityParams): PutCardReturnType => {
    return this.abilitiesMode!.applyAbility(params);
  };

  // Apply concrete abilities

  applyWolfAbility: ApplyAbilityHandler<{
    cardId: number;
    monsterId?: number;
  }> = ({ cardId, monsterId }) => {
    const ability = this.abilitiesMode!.getCurrentAbility();
    const cards = ability.cards!;
    const cardIndex = cards.findIndex((card) => card.id === cardId);

    // TODO double check with `action_experimental` that it equals to "THROW_OFF"
    if (!monsterId) {
      const [thrownAwayCard] = cards.splice(cardIndex, 1);
      // TODO method to throw cards away
      this.cardsThrowedAway[thrownAwayCard.id] = thrownAwayCard;
      return;
    }

    if (cardIndex < 0) {
      throw new Error('ApplyWolfAbility: card is not found in ability state');
    }

    const activePlayer = this.getActivePlayer();

    const placeCardResult = this.placeCardToMonster({
      player: activePlayer,
      card: cards[cardIndex],
      monsterId,
    });

    cards.splice(cardIndex, 1);
    ability.cards = cards;
    return placeCardResult;
  };

  //TODO show by types that cards are defined here!
  applyDropAbility: ApplyAbilityHandler = () => {
    const ability = this.abilitiesMode!.getCurrentAbility()!;
    const player = this.getActivePlayer();
    player.addCards(ability.cards!);
  };

  applySmileAbility: ApplyAbilityHandler<{
    cardId: number;
    monsterId: number;
  }> = ({ cardId, monsterId }) => {
    const activePlayer = this.getActivePlayer();
    return this.placeCardToMonster({ player: activePlayer, cardId, monsterId });
  };

  /**
   * Забрать верхнюю карту чужого монстра на руку
   */
  applyAxeAbility: ApplyAbilityHandler<{
    targetPlayerId: string;
    targetMonsterId: number;
  }> = ({ targetPlayerId, targetMonsterId }) => {
    const player = this.getActivePlayer();
    const targetPlayer = this.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    const removedCard = targetMonster.removeTopBodyPart();
    player.addCard(removedCard);
  };

  /**
   * кости, уничтожить недостроенного монстра целиком
   */
  applyBonesAbility: ApplyAbilityHandler<{
    targetPlayerId: string;
    targetMonsterId: number;
  }> = ({ targetPlayerId, targetMonsterId }) => {
    const targetPlayer = this.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    // check if it's unfinished

    const removedCards = targetMonster.kill();
    removedCards.forEach((card) => {
      this.cardsThrowedAway[card.id] = card;
    });
  };

  /**
   * Выбросить верхнюю карту своего монстра, кроме текущего
   */
  applyTeethAbility: ApplyAbilityHandler<{ targetMonsterId: number }> = ({
    targetMonsterId,
  }) => {
    const player = this.getActivePlayer();
    const targetMonster = player.getMosterById(targetMonsterId);
    const removedCard = targetMonster.removeTopBodyPart();
    this.cardsThrowedAway[removedCard.id] = removedCard;
  };

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

  playerThrowsLegionCard = (playerId: string, cardId: number) => {
    const player = this.getPlayerById(playerId);
    const card = player.findCardOnHandById(cardId);

    this.legionMode?.acceptAndCheckPlayerCard(playerId, card);
    player.removeCardFromHand(cardId);

    // If all responded correctly - launch abilityMode
    if (this.legionMode!.areAllPlayersResponded()) {
      const activePlayer = this.getActivePlayer();
      // activePlayer.id should be equal to this.legionMode!.playerId
      this.startAbilitiesMode(
        activePlayer.id,
        activePlayer.getMosterById(this.legionMode!.monsterId)
      );
      this.stopLegionMode();
      return this.abilitiesMode!.onAbility();
    }

    return {
      type: MESSAGE_TYPE.AWAIT_LEGION_CARD,
      legion: this.legionMode!.getLegionModeState(),
    };
  };
}
