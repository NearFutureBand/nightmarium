import { CARDS } from './Cards';
import { randomInteger } from '../helpers';
import { sortBy } from 'lodash';
import {
  AbilitiesMode,
  AbilityState,
  ApplyAbilityParams,
  Card,
  CardsDatabase,
  GameState,
  Message,
  PlayerState,
} from '../types';
import Player from './Player';
import { ABILITIES, MESSAGE_TYPE } from '../constants';
import Monster from './Monster';

type AbilityMessagePayload = {
  cards?: Card[];
  abilityNumber: number;
  abilityType: number;
  actions: number;
};

type PossibleServerResponseMessage = Message<{
  ability: AbilityMessagePayload;
}> | void;

type ApplyAbilityHandler<T = {}> = (params: T) => void;

export default class Game {
  private cardsAvailable: CardsDatabase;
  private cardsThrowedAway: CardsDatabase;
  private _players: Player[];
  private activePlayerIndex: number | null;
  private actions: number;
  private idMap: { [playerId: string]: number }; // playerId -> index of player in players array
  // TODO make abilitiesState as separate class
  public abilitiesMode: AbilitiesMode | null;
  private applyAbilityMap: {
    [key: number]: (
      params: ApplyAbilityParams
    ) => PossibleServerResponseMessage;
  };

  constructor() {
    this.cardsAvailable = CARDS;
    this.cardsThrowedAway = {};
    this._players = [];
    this.activePlayerIndex = null;
    this.actions = 0;
    this.idMap = {};
    this.abilitiesMode = null;

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

  activePlayerPutsCard = (cardId: number, monsterId: number) => {
    const activePlayer = this.getActivePlayer();
    const targetMonster = activePlayer.placeCardFromHandToMonster(
      cardId,
      monsterId
    );
    this.actions -= 1;

    if (targetMonster?.isDone()) {
      console.log(targetMonster.getBody());
      this.startAbilitiesMode(activePlayer.id, targetMonster);
      return this.onAbility();
    }
    if (this.actions === 0) {
      this.setNextActivePlayer();
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
    const sequence = [...targetMonster.body]
      .reverse()
      .map((bodypart) => bodypart.ability);
    this.abilitiesMode = {
      playerId,
      monsterId: targetMonster.id,
      sequence,
      currentAbilityState: {
        type: sequence[0],
        index: 0,
        done: false,
        inprogress: false,
        actions: this.getActionsNumberByAbilityType(sequence[0]),
      },
    };
    console.log('started ability mode', this.abilitiesMode);
  };

  setNextAbility = () => {
    const ability = this.getCurrentAbility();
    const { sequence } = this.abilitiesMode!;
    const nextIndex = ability.index + 1;

    if (nextIndex === 3) {
      this.stopAbilities();
      return;
    }

    const nextAbilityType = sequence[nextIndex];
    this.abilitiesMode!.currentAbilityState = {
      type: nextAbilityType,
      index: nextIndex,
      done: false,
      inprogress: false,
      actions: this.getActionsNumberByAbilityType(nextAbilityType),
    };

    return this.onAbility();
  };

  getActionsNumberByAbilityType = (abilityType: number | null) => {
    if (abilityType === 0) return 2;
    return 1;
  };

  resetAbilitiesMode = () => {
    this.abilitiesMode = null;
  };

  getCurrentAbility = () => {
    if (!this.abilitiesMode) throw new Error('Not an ability mode');
    return this.abilitiesMode.currentAbilityState;
  };

  onAbility = (): PossibleServerResponseMessage => {
    /** If abilitiesMode doesn't exist the error will be thrown
     * So this.abilitiesState! can be used further
     */
    const ability = this.getCurrentAbility();
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

  stopAbilities = () => {
    this.resetAbilitiesMode();

    if (this.actions === 0) {
      this.setNextActivePlayer();
    }
  };

  applyAbility = (
    params: ApplyAbilityParams
  ): PossibleServerResponseMessage => {
    // currentAbility не может быть null здесь, так как карточки без способностей скипаются в onAbility
    const ability = this.getCurrentAbility()!;

    // ability.type не может быть null здесь, т.к. applyAbility обрабатывает ответ с фронта, а фронт выполняет только существующие способности
    /** способности применяются здесь! */
    this.applyAbilityMap[ability.type!](params);

    ability.actions -= 1;

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

  applyWolfAbility: ApplyAbilityHandler<{
    cardId: number;
    monsterId?: number;
  }> = ({ cardId, monsterId }) => {
    const ability = this.getCurrentAbility()!;
    const abilityType = ability.type!;
    const cards = ability.cards!;
    const cardIndex = cards.findIndex((card) => card.id === cardId);

    // TODO double check with `action_experimental` that it equals to "THROW_OFF"
    if (!monsterId) {
      const [thrownAwayCard] = cards.splice(cardIndex, 1);
      // TODO method to throw cards away
      this.cardsThrowedAway[thrownAwayCard.id] = thrownAwayCard;
      return;
    }

    if (!cardIndex) {
      throw new Error('ApplyWolfAbility: card is not found in ability state');
    }

    const activePlayer = this.getActivePlayer();
    activePlayer.placeCardToMonster(cards[cardIndex], monsterId);
    cards.splice(cardIndex, 1);
    ability.cards = cards;
  };

  //TODO show by types that cards are defined here!
  applyDropAbility: ApplyAbilityHandler = () => {
    const ability = this.getCurrentAbility()!;
    const player = this.getActivePlayer();
    player.addCards(ability.cards!);
  };

  applySmileAbility: ApplyAbilityHandler<{
    cardId: number;
    monsterId: number;
  }> = ({ cardId, monsterId }) => {
    const activePlayer = this.getActivePlayer();
    activePlayer.placeCardFromHandToMonster(cardId, monsterId);
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
}
