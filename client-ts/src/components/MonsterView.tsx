import classNames from 'classnames';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ABILITY_TYPE, MESSAGE_TYPE } from '../constants';
import { validateCardToMonster } from '../helpers';
import { useSendMessage } from '../hooks';
import { selectIsActive, selectLastAction, setDraggedCard, setSelectedMonster } from '../slices/App';
import { AbilityState, Legion, Monster, Player } from '../types';

type Props = {
  monster: Monster;
  player: Player;
  isMe?: boolean;
};

export const MonsterView = ({ children, monster, player, isMe = false }: PropsWithChildren<Props>) => {
  const dispatch = useAppDispatch();
  const draggedCard = useAppSelector((state) => state.app.draggedCard);
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const abilityState = useAppSelector((state) => state.app.abilityState);
  const lastAction = useAppSelector(selectLastAction);

  const sendMessage = useSendMessage();

  const [draggedOver, setDraggedOver] = useState(false);

  const clickable = useIsClickable({ player, abilityState, isMe });

  const droppable = useMemo(() => {
    return clickable;
  }, [clickable]);

  const selected = useMemo(() => {
    return player.id === selectedMonster?.playerId && monster.id === selectedMonster?.monsterId;
  }, [monster.id, player.id, selectedMonster?.monsterId, selectedMonster?.playerId]);

  const handleClick = useCallback(() => {
    if (!clickable) return;
    dispatch(
      setSelectedMonster({
        monsterId: monster.id,
        playerId: player.id,
        monsterBodyLength: monster.body.length,
      })
    );
  }, [clickable, dispatch, monster.body.length, monster.id, player.id]);

  const handleDragEnter = useCallback(() => {
    if (!droppable) return;
    setDraggedOver(true);
  }, [droppable]);

  const handleDragLeave = useCallback(() => {
    if (!droppable) return;
    setDraggedOver(false);
  }, [droppable]);

  const sendMessageWithPayload = useCallback(
    (payload: any) => {
      sendMessage<{ cardId: number; monsterId: number }>({
        cardId: draggedCard!.id,
        monsterId: monster.id,
        ...payload,
      });
      setDraggedOver(false);
    },
    [draggedCard, monster.id, sendMessage]
  );

  const handleDrop = useCallback(() => {
    if (!droppable) return;
    if (!draggedCard) return;

    const validationError = validateCardToMonster({
      selectedCard: {
        cardId: draggedCard.id,
        cardBodypart: draggedCard.bodypart,
        legion: draggedCard.legion,
      },
      selectedMonster: {
        monsterId: monster.id,
        playerId: player.id,
        monsterBodyLength: monster.body.length,
      },
      lastAction,
      abilityState,
    });
    if (validationError) {
      toast(validationError, { type: 'error' });
      dispatch(setDraggedCard(null));
      setDraggedOver(false);
      return;
    }

    const wolfOrSmileAbility = abilityState?.abilityType === ABILITY_TYPE.SMILE || abilityState?.abilityType === ABILITY_TYPE.WOLF;

    if (wolfOrSmileAbility) {
      sendMessageWithPayload({
        type: MESSAGE_TYPE.SUBMIT_ABILITY,
        abilityType: abilityState.abilityType,
      });
      return;
    }

    sendMessageWithPayload({
      type: MESSAGE_TYPE.PLAY_CARD,
    });
  }, [abilityState, dispatch, draggedCard, droppable, lastAction, monster.body.length, monster.id, player.id, sendMessageWithPayload]);

  return (
    <div
      className={classNames('monster', { clickable, draggedOver, selected, full: monster.body.length === 3 })}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

function useIsClickable({ player, abilityState, isMe }: { player: Player; abilityState: AbilityState | null; isMe: boolean }) {
  const isActive = useAppSelector(selectIsActive(player.id));
  const legionState = useAppSelector((state) => state.app.awaitingLegion);
  const winnerId = useAppSelector((state) => state.app.winnerId);

  const clickable = useMemo(() => {
    if (winnerId) return false;
    if (abilityState) {
      const dropAbility = abilityState.abilityType === ABILITY_TYPE.DROP;
      const axeAbility = abilityState.abilityType === ABILITY_TYPE.AXE;
      const bonesAbility = abilityState.abilityType === ABILITY_TYPE.BONES;
      const teethAbility = abilityState.abilityType === ABILITY_TYPE.TEETH;
      const smileAbility = abilityState.abilityType === ABILITY_TYPE.SMILE;

      if (axeAbility && isMe) return false;
      if (dropAbility) return false;
      if (bonesAbility && isMe) return false;
      if (teethAbility && !isMe) return false;
      if (smileAbility && !isMe) return false;
    }

    if (legionState) return false;

    // TODO добавить кейс, если монстр полный, то в обычном режиме игры он не может быть выбран

    if (!abilityState && (!isMe || !isActive)) return false;

    return true;
  }, [abilityState, isActive, isMe, legionState, winnerId]);

  return clickable;
}
