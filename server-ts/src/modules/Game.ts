import { CARDS } from './Cards';
import { randomInteger } from '../helpers';
import { sortBy } from 'lodash';
import {
  AbilitiesState,
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
};

export default class Game {
  private cardsAvailable: CardsDatabase;
  private cardsThrowedAway: CardsDatabase;
  private _players: Player[];
  private activePlayerIndex: number | null;
  private actions: number;
  private idMap: { [playerId: string]: number }; // playerId -> index of player in players array
  // TODO make abilitiesState as separate class
  public abilitiesState: AbilitiesState | null;

  constructor() {
    this.cardsAvailable = CARDS;
    this.cardsThrowedAway = {};
    this._players = [];
    this.activePlayerIndex = null;
    this.actions = 0;
    this.idMap = {};
    this.abilitiesState = null;
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
      cardsAvailable: this.cardsAvailable,
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

    const targetMonster = activePlayer.placeCardToMonster(cardId, monsterId);

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

  startAbilitiesMode = (playerId: string, targetMonster: Monster) => {
    this.abilitiesState = {
      playerId,
      monsterId: targetMonster.id,
      abilities: [...targetMonster.body].reverse().map((bodypart, index) => {
        return bodypart.ability
          ? {
              type: bodypart.ability,
              done: false,
              inprogress: false,
            }
          : null;
      }),
      currentAbilityIndex: 0,
    };
  };

  resetAbilitiesMode = () => {
    this.abilitiesState = null;
  };

  areAbilitiesCompelete = () => {
    return this.abilitiesState!.currentAbilityIndex >= 3;
  };

  getCurrentAbility = () => {
    if (!this.abilitiesState) throw new Error('Not an ability mode');
    return this.abilitiesState.abilities[
      this.abilitiesState.currentAbilityIndex
    ];
  };

  onAbility = (): Message<{ ability: AbilityMessagePayload }> | undefined => {
    /** If abilitiesState doesn't exist the error will be thrown
     * So this.abilitiesState! can be used further
     */
    const ability = this.getCurrentAbility();
    console.log('current ability: ', ability);

    if (ability === null) {
      console.log('no ability');
      this.abilitiesState!.currentAbilityIndex++;
      // Skip a card without ability and activate the next ability
      return this.onAbility();
    }

    if (this.areAbilitiesCompelete()) {
      this.stopAbilities();
      return;
    }

    ability.inprogress = true;

    const payload: AbilityMessagePayload = {
      abilityNumber: this.abilitiesState!.currentAbilityIndex,
      abilityType: ability.type,
    };

    if (ability.type <= 1) {
      // волк
      // выдать две карты чтобы игрок сразу попытался их применить
      // или
      // взять две карты на руку
      payload.cards = [this.giveCard(), this.giveCard()];
    }
    return {
      type: MESSAGE_TYPE.AWAIT_ABILITY,
      ability: payload,
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

  applyAbility = ({
    cards,
    abilityNumber,
    abilityType,
    cardId,
    monsterId,
    playerId,
  }: ApplyAbilityParams):
    | Message<{ ability: AbilityMessagePayload }>
    | undefined => {
    // currentAbility не может быть null здесь, так как карточки без способностей скипаются в onAbility
    const ability = this.getCurrentAbility()!;

    switch (abilityType) {
      case ABILITIES.DROP: {
        this.applyDropAbility(cards);
        break;
      }
      case ABILITIES.SMILE: {
        this.applySmileAbility(cardId, monsterId);
        break;
      }
      case ABILITIES.AXE: {
        this.applyAxeAbility(playerId, monsterId);
        break;
      }
      case ABILITIES.BONES: {
        this.applyBonesAbility(playerId, monsterId);
        break;
      }
      case ABILITIES.TEETH: {
        this.applyTeethAbility(monsterId);
        break;
      }
    }

    ability!.done = true;
    ability!.inprogress = false;
    this.abilitiesState!.currentAbilityIndex++;

    return this.onAbility();
  };

  applyWolfAbility = () => {};

  applyDropAbility = (cards: Card[]) => {
    const player = this.getActivePlayer();
    player.addCards(cards);
  };

  applySmileAbility = (cardId: number, monsterId: number) => {
    const activePlayer = this.getActivePlayer();
    activePlayer.placeCardToMonster(cardId, monsterId);
  };

  /**
   * Забрать верхнюю карту чужого монстра на руку
   */
  applyAxeAbility = (targetPlayerId: string, targetMonsterId: number) => {
    const player = this.getActivePlayer();
    const targetPlayer = this.getPlayerById(targetPlayerId);
    const targetMonster = targetPlayer.getMosterById(targetMonsterId);

    const removedCard = targetMonster.removeTopBodyPart();
    player.addCard(removedCard);
  };

  /**
   * кости, уничтожить недостроенного монстра целиком
   */
  applyBonesAbility = (targetPlayerId: string, targetMonsterId: number) => {
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
  applyTeethAbility = (targetMonsterId: number) => {
    const player = this.getActivePlayer();
    const targetMonster = player.getMosterById(targetMonsterId);
    const removedCard = targetMonster.removeTopBodyPart();
    this.cardsThrowedAway[removedCard.id] = removedCard;
  };

  stopAbilities = () => {
    this.resetAbilitiesMode();

    if (this.actions === 0) {
      this.setNextActivePlayer();
    }
  };
}
