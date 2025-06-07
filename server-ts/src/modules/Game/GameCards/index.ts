import { Card } from 'src/types';
import { getShuffledCards } from './utils';

export default class GameCards {
  private cardsAvailable: Card[];
  private cardsThrownAway: Card[];

  constructor() {
    this.cardsAvailable = getShuffledCards();
    this.cardsThrownAway = [];
  }

  giveDefaulCards = (): Card[] => {
    return new Array(6).fill(null).map(() => {
      return this.giveCard();
    });
  };

  giveCard = () => {
    const card = this.cardsAvailable[0];
    this.cardsAvailable = this.cardsAvailable.slice(1);
    return card;
  };

  throwCardAway = (card: Card) => {
    this.cardsThrownAway.push(card);
  };

  throwCardsAway = (cards: Card[]) => {
    cards.forEach((card) => this.throwCardAway(card));
  };

  private findCardIndexById = (cardId: number, cards: Card[]): number | undefined => {
    const result = cards.findIndex((card) => card.id === cardId);
    if (result === -1) return undefined;
    return result;
  };
}
