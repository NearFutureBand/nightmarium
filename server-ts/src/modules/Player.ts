import { omit } from 'lodash';
import { Card, PlayerState } from '../types';
import { CARDS } from './Cards';
import Monster from './Monster';
import { WebSocket } from 'ws';

export default class Player {
  private _id: string;
  private name: string | null;
  private cards: Card[];
  private monsters: Monster[];

  constructor(id: string, cards: Card[]) {
    this._id = id;
    this.name = null;
    this.cards = cards;
    this.monsters = new Array(5).fill(0).map((_, i) => new Monster(i));
  }

  public get id() {
    return this._id;
  }

  public setName = (name: string) => {
    this.name = name;
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
    const cardIndex = this.findCardOnHandById(cardId);
    const card = this.cards[cardIndex];
    targetMonster.addCard(card);
    this.cards.splice(cardIndex, 1);
    return targetMonster;
  };

  public findCardOnHandById = (cardId: number) => {
    return this.cards.findIndex((card) => card.id === cardId);
  };

  public getMosterById = (monsterId: number) => {
    return this.monsters[monsterId];
  };
}
