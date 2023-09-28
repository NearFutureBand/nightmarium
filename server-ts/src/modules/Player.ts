import { generateCryptoId } from "../helpers";
import { Card, PlayerState } from "../types";
import Monster from "./Monster";

export class User {
  id: string;
  name: string | null;
  gameId: string | undefined;
  readyToPlay: boolean;

  constructor() {
    this.id = generateCryptoId();
    this.name = null;
    this.gameId = undefined;
    this.readyToPlay = false;
  }

  public setName = (name: string) => {
    this.name = name;
  };

  public setReadyToPlayState = (state: boolean) => {
    this.readyToPlay = state;
  };
}

export default class Player {
  private _id: string;
  private name: string | null;
  private cards: Card[];
  private monsters: Monster[];

  constructor(id: string, name: string | null) {
    this._id = id;
    this.name = name;
    this.cards = [];
    this.monsters = [];
  }

  public get id() {
    return this._id;
  }

  public engage = (cards: Card[]) => {
    this.cards = cards;
    this.monsters = new Array(5).fill(0).map((_, i) => new Monster(i));
  };

  public reset = () => {
    this.cards = [];
    this.monsters = [];
  };

  public getPlayerState = (isMe?: boolean): PlayerState<Card[] | number> => {
    return {
      id: this._id,
      name: this.name,
      cards: isMe ? this.cards : this.cards.length,
      monsters: this.monsters,
    };
  };

  public addCard = (card: Card) => {
    this.cards.push(card);
  };

  public addCards = (cards: Card[]) => {
    cards.forEach((card) => this.addCard(card));
  };

  public placeCardToMonster = (card: Card, monsterId: number): Monster => {
    const targetMonster = this.monsters[monsterId];
    targetMonster.addCard(card);
    return targetMonster;
  };

  public placeCardFromHandToMonster = (
    cardId: number,
    monsterId: number
  ): Monster => {
    const targetMonster = this.monsters[monsterId];
    const card = this.findCardOnHandById(cardId);
    targetMonster.addCard(card);
    this.removeCardFromHand(cardId);
    return targetMonster;
  };

  public findCardIndexOnHandById = (cardId: number) => {
    const cardIndex = this.cards.findIndex((card) => card.id === cardId);
    if (cardIndex < 0) throw new Error(`card ${cardId} is not found on hand`);
    return cardIndex;
  };

  public findCardOnHandById = (cardId: number): Card => {
    const card = this.cards.find((card) => card.id === cardId);
    if (!card) throw new Error(`card ${cardId} is not found on hand`);
    return card;
  };

  public getMosterById = (monsterId: number) => {
    return this.monsters[monsterId];
  };

  public howManyMonstersDone = () => {
    return this.monsters.reduce(
      (doneMonsters, monster) =>
        monster.isDone() ? doneMonsters + 1 : doneMonsters,
      0
    );
  };

  public howManyCards = () => {
    return this.cards.length;
  };

  public removeCardFromHand = (cardId: number): Card => {
    const cardIndex = this.findCardIndexOnHandById(cardId);
    const [removedCard] = this.cards.splice(cardIndex, 1);
    return removedCard;
  };

  public removeCardsFromHand = (cardIds: number[]): Card[] => {
    return cardIds.map((cardId) => this.removeCardFromHand(cardId));
  };
}
