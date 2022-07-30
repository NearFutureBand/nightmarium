import { Card } from '../types';

export default class Monster {
  private id: number;
  private body: Card[];
  private abilitiesUsed: boolean;

  constructor(id: number, body: Card[] = []) {
    this.id = id;
    this.body = body;
    this.abilitiesUsed = false;
  }
}
