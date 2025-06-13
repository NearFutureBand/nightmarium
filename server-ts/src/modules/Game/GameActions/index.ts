import { GAME_ACTIONS } from 'src/constants';
import GameState from '../GameState';
import { PlayCardResult } from './types';
import Player from 'src/modules/Player';
import { Card } from 'src/types';
import { LegionStateSerialized } from '../GameModes/Legion/types';
import { generateError } from 'src/constants/errors';
import GameModes from '../GameModes';
import { ApplyAbilityParams } from '../GameModes/Abilities/AbilitiesController/types';

export default class GameActions extends GameModes {
  constructor() {
    super();
  }

  public playerTakesCard = () => {
    const activePlayer = this.players.getActivePlayer();
    if (!activePlayer) {
      throw { error: true, message: 'No active player found' };
    }
    const card = this.cards.giveCard();
    activePlayer.addCard(card);
    this.minusAction(GAME_ACTIONS.TAKE_CARD);
  };

  public playerPutsCard = (cardId: number, monsterId: number) => {
    const activePlayer = this.players.getActivePlayer();
    if (!activePlayer) {
      throw { error: true, message: 'No active player found' };
    }

    const playCardResult = this.placeCardToMonster({
      player: activePlayer,
      cardId,
      monsterId
    });

    if (!playCardResult.error && playCardResult.putCardOnly) {
      this.minusAction(playCardResult.lastAction);
    }
    if (!playCardResult.error && (playCardResult.legionMode || playCardResult.abilitiesMode)) {
      this.minusActionWithoutPassToNextPlayer(playCardResult.lastAction);
    }

    return playCardResult;
  };

  public playerExchangesCards = (cardIds: number[]): void => {
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

  public playerThrowsLegionCard = (playerId: string, cardIds: number[]) => {
    const player = this.players.getPlayerById(playerId);
    const cards = cardIds.map((cardId) => player.findCardOnHandById(cardId));
    /** @todo add validation */
    this.legionState?.acceptAndCheckPlayerCard(playerId, cards);
    const removedCards = player.removeCardsFromHand(cardIds);
    this.cards.throwCardsAway(removedCards);

    if (this.legionState?.areAllPlayersResponded()) {
      const activePlayer = this.players.getActivePlayer();
      if (!activePlayer || activePlayer.id !== this.legionState.getCurrentPlayerId()) {
        throw generateError('active_player_and_legion_player_mismatch');
      }

      const currentMonsterId = this.legionState.getCurrentMonsterId();
      if (!currentMonsterId) {
        throw generateError('not_found_monster_by_id', { monsterId: String(currentMonsterId) });
      }
      const abilitiesModeResult = this.startAbilitiesMode(
        activePlayer.id,
        activePlayer.getMosterById(currentMonsterId)
      );
      this.stopLegionMode();
      return { error: undefined, abilitiesMode: true, ...abilitiesModeResult };
    }

    return {
      error: undefined,
      legionMode: true
    };
  };

  public playerUsesAbility = (params: ApplyAbilityParams) => {
    console.log('playerUsesAbility', params);
    const result = this.applyAbility(params);
    console.log(result);
    // apply current ability
    // return data for the next ability
    // if all abilities complete - stop abilities mode and continue game
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
  }): PlayCardResult => {
    /** @todo add validation */
    const targetMonster = card
      ? player.placeCardToMonster(card, monsterId)
      : player.placeCardFromHandToMonster(cardId!, monsterId);

    if (targetMonster.isDone()) {
      const monstersDone = player.howManyMonstersDone();
      const monsterHasTeethAbility = targetMonster.hasTeethAbility();
      const isWinner = monstersDone === this.monstersToWin && !monsterHasTeethAbility;

      if (isWinner) {
        this.gameOver(player.id, () => {
          this.stopLegionMode();
          this.stopAbilitiesMode();
        });
        return { gameOver: true };
      }

      const lastAction = GAME_ACTIONS.PLAY_CARD(
        targetMonster.body[targetMonster.body.length - 1].legion
      );

      const monsterLegion = targetMonster.isOfSameColor();
      if (monsterLegion && this.players.getAllPlayers().length > 1) {
        this.startLegionMode({
          playerId: player.id,
          monsterId: targetMonster.id,
          legion: monsterLegion,
          otherPlayers: this.players.getOtherPlayers(player.id)
        });
        return {
          legionMode: true,
          lastAction
        };
      }

      const abilitiesModeResult = this.startAbilitiesMode(player.id, targetMonster);
      /** @todo skip monster abilities if no abilities */
      /** @todo if abilities mode is started - return abilities state and given cards */
      return { abilitiesMode: true, lastAction, ...abilitiesModeResult };
    }

    return {
      lastAction: GAME_ACTIONS.PLAY_CARD(targetMonster.body[targetMonster.body.length - 1].legion),
      putCardOnly: true
    };
  };
}
