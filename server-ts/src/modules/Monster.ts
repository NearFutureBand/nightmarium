import { ABILITIES } from '../constants';
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

  addCard = (card: Card) => {
    const possibleToInstall = card.bodypart.some(
      (bodypartIndex) => bodypartIndex === this.body.length
    );
    if (!possibleToInstall)
      throw new Error(
        `This card is impossible to install. Card: ${card.toString()}`
      );
    this.body.push(card);
  };

  isDone = () => {
    return this.body.length === 3;
  };

  getBody = () => {
    return this.body;
  };

  removeTopBodyPart = (): Card => {
    const [removedCard] = this.body.splice(this.body.length - 1, 1);
    return removedCard;
  };

  kill = (): Card[] => {
    const removedCards = [...this.body];
    this.body = [];
    return removedCards;
  };

  hasTeethAbility = (): boolean => {
    return this.body.some((card) => card.ability === ABILITIES.TEETH);
  };

  isOfSameColor = (): Card['legion'] | undefined => {
    let color = this.body[0].legion;
    for (let i = 1; i < this.body.length; i++) {
      if (color !== this.body[i].legion) return;
    }
    return color;
  };
}
