import { CARDS } from '../Cards';
import { randomInteger } from '../../helpers';
import {
  AbilitiesState,
  AbilityOneData,
  ApplyAbilityParams,
  Card,
  CardsDatabase,
  GameState,
  Message,
  PlayerState,
} from '../../types';
import Player from '../Player';
import { ABILITIES, MESSAGE_TYPE } from '../../constants';
import Monster from '../Monster';

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
  private abilitiesState: AbilitiesState | null;

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
    // TODO remove 'as'
    return {
      cardsAvailable: this.cardsAvailable,
      cardsThrowedAway: this.cardsThrowedAway,
      activePlayer:
        this.getActivePlayer()?.getPlayerState() as PlayerState<number>,
      me: requestPlayerId
        ? (this.getPlayerById(requestPlayerId).getPlayerState(
            true
          ) as PlayerState<Card[]>)
        : undefined,
      players: this.players.map(
        (player) => player.getPlayerState() as PlayerState<number>
      ),
      actions: this.actions,
      //abilitiesState: this.abilitiesState || undefined,
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
    if (this.activePlayerIndex !== 0 && !this.activePlayerIndex) return null;
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
    if (!activePlayer) throw new Error('Active player not found');

    const targetMonster = activePlayer?.placeCardToMonster(cardId, monsterId);

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
    return this.abilitiesState!.currentAbilityIndex === 3;
  };

  getCurrentAbility = () => {
    if (!this.abilitiesState) throw new Error('Not an ability mode');
    return this.abilitiesState.abilities[
      this.abilitiesState.currentAbilityIndex
    ];
  };

  onAbility = (): Message | undefined => {
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

    ability.inprogress = true;

    // TODO
    if (this.areAbilitiesCompelete()) {
      this.resetAbilitiesMode();

      if (this.actions === 0) {
        this.setNextActivePlayer();
      }

      // TODO broadcast

      // this.forEachPlayer((player) => {
      //   player.sendMessage('MONSTER_COMPLETED', { game: game.getGame() });
      // });
      return;
    }

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

    //   game.players.forEach(player => {
    //     player.sendMessage("AWAIT_ABILITY", { game: game.getGame(), ...payload });
    //   });
    return {
      type: MESSAGE_TYPE.AWAIT_ABILITY,
      ...payload,
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
  }: ApplyAbilityParams): Message | undefined => {
    const ability = this.getCurrentAbility();

    if (ability!.type === 1) {
      this.applyAbilityOne(cards);
    }

    ability!.done = true;
    ability!.inprogress = false;
    this.abilitiesState!.currentAbilityIndex++;

    return this.onAbility();
  };

  applyAbilityOne = (cards: Card[]) => {
    const player = this.getActivePlayer();
    if (!player) throw new Error('Ability 1: Active player not found');
    player.addCard(cards[0]);
    player.addCard(cards[1]);
  };
}
