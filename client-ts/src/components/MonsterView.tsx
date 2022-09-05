import classNames from 'classnames';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ABILITY_TYPE, MESSAGE_TYPE } from '../constants';
import { useSendMessage } from '../hooks';
import { selectIsActive, setSelectedMonster } from '../slices/App';
import { Monster, Player } from '../types';

type Props = {
  monster: Monster;
  player: Player;
  isMe?: boolean;
};

export const MonsterView = ({
  children,
  monster,
  player,
  isMe = false,
}: PropsWithChildren<Props>) => {
  const dispatch = useAppDispatch();
  const draggedCard = useAppSelector((state) => state.app.draggedCard);
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const abilityState = useAppSelector((state) => state.app.abilityState);
  const legionState = useAppSelector((state) => state.app.awaitingLegion);

  const isActive = useAppSelector(selectIsActive(player.id));

  const sendMessage = useSendMessage();

  const [draggedOver, setDraggedOver] = useState(false);

  const clickable = useMemo(() => {
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

    if (!abilityState && (!isMe || !isActive)) return false;

    return true;
  }, [abilityState, isActive, isMe, legionState]);

  const droppable = useMemo(() => {
    return clickable;
  }, [clickable]);

  const selected = useMemo(() => {
    return (
      player.id === selectedMonster?.playerId &&
      monster.id === selectedMonster?.monsterId
    );
  }, [
    monster.id,
    player.id,
    selectedMonster?.monsterId,
    selectedMonster?.playerId,
  ]);

  const handleClick = useCallback(() => {
    if (!clickable) return;
    dispatch(
      setSelectedMonster({ monsterId: monster.id, playerId: player.id })
    );
  }, [clickable, dispatch, monster.id, player.id]);

  const handleDragEnter = useCallback(() => {
    if (!droppable) return;
    setDraggedOver(true);
  }, [droppable]);

  const handleDragLeave = useCallback(() => {
    if (!droppable) return;
    setDraggedOver(false);
  }, [droppable]);

  const handleDrop = useCallback(() => {
    if (!droppable) return;
    if (!draggedCard) return;
    if (
      abilityState?.abilityType === ABILITY_TYPE.SMILE ||
      abilityState?.abilityType === ABILITY_TYPE.WOLF
    ) {
      // TODO refactor
      sendMessage<{ cardId: number; monsterId: number; abilityType: number }>({
        type: MESSAGE_TYPE.SUBMIT_ABILITY,
        cardId: draggedCard.id,
        monsterId: monster.id,
        abilityType: abilityState.abilityType,
      });
      setDraggedOver(false);
      return;
    }
    sendMessage<{ cardId: number; monsterId: number }>({
      type: MESSAGE_TYPE.PLAY_CARD,
      cardId: draggedCard.id,
      monsterId: monster.id,
    });
    setDraggedOver(false);
  }, [
    abilityState?.abilityType,
    draggedCard,
    droppable,
    monster.id,
    sendMessage,
  ]);

  return (
    <div
      className={classNames('monster', { clickable, draggedOver, selected })}
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
