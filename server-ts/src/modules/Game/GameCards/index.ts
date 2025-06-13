import { Card } from 'src/types';
import { getShuffledCards } from './utils';

export default class GameCards {
  private cardsAvailable: Card[];
  private cardsThrownAway: Card[];

  constructor() {
    this.cardsAvailable = getShuffledCards();
    this.cardsThrownAway = [];
  }

  public giveDefaulCards = (): Card[] => {
    return new Array(6).fill(null).map(() => {
      return this.giveCard();
    });
  };

  public giveCard = () => {
    const card = this.cardsAvailable[0];
    this.cardsAvailable = this.cardsAvailable.slice(1);
    return card;
  };

  public throwCardAway = (card: Card) => {
    this.cardsThrownAway.push(card);
  };

  public throwCardsAway = (cards: Card[]) => {
    cards.forEach((card) => this.throwCardAway(card));
  };

  private findCardIndexById = (cardId: number, cards: Card[]): number | undefined => {
    const result = cards.findIndex((card) => card.id === cardId);
    if (result === -1) return undefined;
    return result;
  };

  public replaceCards = (cardId: number, targetIndex: number) => {
    let cardIndexFromAvailable = this.findCardIndexById(cardId, this.cardsAvailable);
    if (cardIndexFromAvailable !== undefined) {
      const [movingCard] = this.cardsAvailable.splice(cardIndexFromAvailable, 1);
      this.cardsAvailable.splice(targetIndex, 0, movingCard);
      return;
    }
    cardIndexFromAvailable = this.findCardIndexById(cardId, this.cardsThrownAway);
    if (cardIndexFromAvailable === undefined) return;
    const [movingCard] = this.cardsThrownAway.splice(cardIndexFromAvailable, 1);
    this.cardsAvailable.splice(targetIndex, 0, movingCard);
  };
}
