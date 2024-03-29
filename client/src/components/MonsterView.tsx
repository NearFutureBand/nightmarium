import classNames from "classnames";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch } from "src/hooks/useAppDispatch";
import { useAppSelector } from "src/hooks/useAppSelector";
import { ABILITY_TYPE, MESSAGE_TYPE } from "src/constants";
import { validateCardToMonster } from "src/helpers";
import { useSendMessage } from "src/hooks/useWebsocket";
import {
  selectIsActive,
  selectLastAction,
  setDraggedCard,
  setSelectedMonster,
} from "src/slices/App";
import { AbilityState, Monster, Player } from "src/types";

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
  const lastAction = useAppSelector(selectLastAction);
  const gameId = useAppSelector((state) => state.app.me?.gameId);

  const sendMessage = useSendMessage();

  const [draggedOver, setDraggedOver] = useState(false);

  const clickable = useIsClickable({ player, abilityState, isMe });

  const droppable = useMemo(() => {
    return clickable;
  }, [clickable]);

  const selected = useMemo(() => {
    return (
      player.id === selectedMonster?.userId &&
      monster.id === selectedMonster?.monsterId
    );
  }, [
    monster.id,
    player.id,
    selectedMonster?.monsterId,
    selectedMonster?.userId,
  ]);

  const handleClick = useCallback(() => {
    if (!clickable) return;
    dispatch(
      setSelectedMonster({
        monsterId: monster.id,
        userId: player.id,
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
    // TODO generic ?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload: any) => {
      sendMessage<{ cardId: number; monsterId: number; gameId: string }>({
        monsterId: monster.id,
        gameId,
        ...payload,
      });
      setDraggedOver(false);
    },
    [gameId, monster.id, sendMessage]
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
        userId: player.id,
        monsterBodyLength: monster.body.length,
      },
      lastAction,
      abilityState,
    });
    if (validationError) {
      toast(validationError, { type: "error" });
      dispatch(setDraggedCard(null));
      setDraggedOver(false);
      return;
    }

    if (abilityState?.abilityType === ABILITY_TYPE.WOLF) {
      sendMessageWithPayload({
        type: MESSAGE_TYPE.SUBMIT_ABILITY,
        abilityType: abilityState.abilityType,
        cardIds: [draggedCard.id],
      });
      return;
    }

    if (abilityState?.abilityType === ABILITY_TYPE.SMILE) {
      sendMessageWithPayload({
        type: MESSAGE_TYPE.SUBMIT_ABILITY,
        abilityType: abilityState.abilityType,
        cardId: draggedCard.id,
      });
      return;
    }

    sendMessageWithPayload({
      type: MESSAGE_TYPE.PLAY_CARD,
      cardId: draggedCard.id,
    });
  }, [
    abilityState,
    dispatch,
    draggedCard,
    droppable,
    lastAction,
    monster.body.length,
    monster.id,
    player.id,
    sendMessageWithPayload,
  ]);

  return (
    <div
      className={classNames("monster", {
        clickable,
        draggedOver,
        selected,
        full: monster.body.length === 3,
      })}
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

function useIsClickable({
  player,
  abilityState,
  isMe,
}: {
  player: Player;
  abilityState: AbilityState | null;
  isMe: boolean;
}) {
  const isActive = useAppSelector(selectIsActive(player.id));
  const legionState = useAppSelector((state) => state.app.awaitingLegion);
  const winnerId = useAppSelector((state) => state.app.game?.winnerId);

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
