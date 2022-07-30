import { omit } from 'lodash';
import { Card } from '../types';
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

  public getPlayerState = () => {
    return {
      id: this._id,
      name: this.name,
      cards: this.cards.length,
      monsters: this.monsters,
    };
  };
}
