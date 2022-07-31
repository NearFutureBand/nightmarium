import { Card } from '../types';

export default class Monster {
  public id: number;
  public body: Card[];
  private abilitiesUsed: boolean;

  constructor(id: number, body: Card[] = []) {
    this.id = id;
    this.body = body;
    this.abilitiesUsed = false;
  }

  addCard = (card: Card): boolean => {
    const possibleToInstall = card.bodypart.some(
      (bodypartIndex) => bodypartIndex === this.body.length
    );
    // TODO throw error ?
    if (!possibleToInstall) return false;
    this.body.push(card);
    return true;
  };

  isDone = () => {
    return this.body.length === 3;
  };

  getBody = () => {
    return this.body;
  };
}
