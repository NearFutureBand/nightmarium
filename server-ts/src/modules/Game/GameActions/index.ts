import { GAME_ACTIONS } from 'src/constants';
import GameState from '../GameState';
import { PutCardReturnType } from './types';
import Player from 'src/modules/Player';
import { Card } from 'src/types';

export default class GameActions extends GameState {
  constructor() {
    super();
  }

  public activePlayerTakesCard = () => {
    const activePlayer = this.players.getActivePlayer();
    if (!activePlayer) {
      throw { error: true, message: 'No active player found' };
    }
    const card = this.cards.giveCard();
    activePlayer.addCard(card);
    this.minusAction(GAME_ACTIONS.TAKE_CARD);
  };

  public activePlayerPutsCard = (cardId: number, monsterId: number) => {
    const activePlayer = this.players.getActivePlayer();
    if (!activePlayer) {
      throw { error: true, message: 'No active player found' };
    }

    // TODO test it and put this function to the smile and wolf ability handler
    // TODO combine this bit with actions decrement more clear
    const { lastAction } = this.placeCardToMonster({
      player: activePlayer,
      cardId,
      monsterId
    });

    this.minusAction(lastAction);

    /** @todo why ? */
    // this.actions -= 1;
    // if (this.actions === 0 && !placeCardResult) {
    //   this.setNextActivePlayer();
    //   return;
    // }

    // return placeCardResult;
  };

  public activePlayerExchangesCards = (cardIds: number[]): void => {
    const activePlayer = this.players.getActivePlayer();
    if (!activePlayer) {
      throw { error: true, message: 'No active player found' };
    }
    const removedCards = activePlayer.removeCardsFromHand(cardIds);
    this.cards.throwCardsAway(removedCards);
    activePlayer.addCards(
      new Array(Math.floor(cardIds.length / 2)).fill(null).map(() => this.cards.giveCard())
    );
    this.minusAction(GAME_ACTIONS.CHANGE_CARDS);
  };

  private placeCardToMonster = ({
    player,
    cardId,
    monsterId,
    card
  }: {
    player: Player;
    cardId?: number;
    monsterId: number;
    card?: Card;
  }) => {
    /** @todo add validation */
    const targetMonster = card
      ? player.placeCardToMonster(card, monsterId)
      : player.placeCardFromHandToMonster(cardId!, monsterId);

    return {
      lastAction: GAME_ACTIONS.PLAY_CARD(targetMonster.body[targetMonster.body.length - 1].legion)
    };

    // Не запоминать последний ход, если находимся в режиме способности
    // if (!this.abilitiesMode) {
    //   this.lastAction = GAME_ACTIONS.PLAY_CARD(
    //     targetMonster.body[targetMonster.body.length - 1].legion
    //   );
    // }

    // if (targetMonster.isDone()) {
    //   console.log('monster is done', targetMonster.getBody());
    //   const monstersDone = player.howManyMonstersDone();
    //   const monsterHasTeethAbility = targetMonster.hasTeethAbility();

    //   // ПОБЕДА одного из игроков
    //   if (monstersDone === this.monstersToWin && !monsterHasTeethAbility) {
    //     return this.gameOver(player.id);
    //   }

    //   const monsterLegion = targetMonster.isOfSameColor();
    //   // Собран монстр одного цвета
    //   if (monsterLegion && this.players.length > 1) {
    //     this.startLegionMode(player.id, targetMonster.id, monsterLegion);
    //     return {
    //       type: MESSAGE_TYPE.AWAIT_LEGION_CARD,
    //       legion: this.legionMode!.getLegionModeState()
    //     };
    //   }

    //   this.startAbilitiesMode(player.id, targetMonster);
    //   return this.abilitiesMode!.onAbility();
    // }
  };
}
