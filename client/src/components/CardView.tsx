import { FC, useCallback, useMemo } from "react";
import classNames from "classnames";

import { AbilityState, Card, LegionState, Monster, Player } from "src/types";
import { MONSTER_PART } from "src/img";
import { ABILITIES, ABILITY_TYPE, BODYPARTS, COLORS } from "src/constants";
import { useAppDispatch } from "src/hooks/useAppDispatch";
import { useAppSelector } from "src/hooks/useAppSelector";
import {
  selectIsActive,
  setDraggedCard,
  setSelectedCard,
} from "src/slices/App";
import { isCardInSelection } from "../helpers";

type Props = {
  card: Card;
  monster?: Monster;
  player?: Player;
  isMe?: boolean;
  cardOnHand?: boolean;
  cardInControls?: boolean;
};

// TODO хз что это
// const hasMatchingPlaceToBeInstalled = (
//   card: Card,
//   availableBodyparts: Set<number>
// ): boolean => {
//   return card.bodypart.some((bodypartIndex) =>
//     availableBodyparts.has(bodypartIndex)
//   );
// };

export const CardWithImage: FC<Props> = ({
  card,
  monster,
  player,
  isMe = false,
  cardOnHand = false,
  // cardInControls = false, // TODO apply this prop
}) => {
  const dispatch = useAppDispatch();
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const draggedCard = useAppSelector((state) => state.app.draggedCard);
  const abilityState = useAppSelector((state) => state.app.abilityState);
  const legionState = useAppSelector((state) => state.app.awaitingLegion);

  const isMyTurn = useAppSelector(selectIsActive(player?.id));

  const { disabled, clickable, draggable } = useCardStatus({
    card,
    isMyTurn,
    cardOnHand,
    abilityState,
    isMe,
    legionState,
  });

  const multiSelectAllowed = useMemo(() => {
    // if (legionState && cardOnHand && !isMyTurn) return true;
    // if (
    //   abilityState &&
    //   abilityState.abilityType === ABILITY_TYPE.WOLF &&
    //   cardInControls
    // )
    //   return true;

    // return false;
    return true;
  }, []);

  const isDragged = useMemo(() => {
    return draggedCard?.id === card.id;
  }, [card.id, draggedCard?.id]);

  const selected = useMemo(() => {
    return isCardInSelection(
      {
        cardId: card.id,
        monsterId: monster?.id,
        playerId: player?.id,
      },
      selectedCards
    );
  }, [card.id, monster?.id, player?.id, selectedCards]);

  const image = MONSTER_PART[card.id];

  const style = useMemo(() => {
    return {
      backgroundColor: !image ? COLORS[card.legion] : undefined,
      backgroundImage: `url(${image})`,
      //marginLeft: `-${offset}rem`,
      //zIndex,
      //boxShadow: "1px 0px 1px black"
    };
  }, [card.legion, image]);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!clickable) return;
      dispatch(
        setSelectedCard({
          cardId: card.id,
          monsterId: monster?.id,
          playerId: player?.id,
          shiftPressed: multiSelectAllowed ? event.shiftKey : false,
          cardBodypart: card.bodypart,
          legion: card.legion,
        })
      );
    },
    [
      card.bodypart,
      card.id,
      card.legion,
      clickable,
      dispatch,
      monster?.id,
      multiSelectAllowed,
      player?.id,
    ]
  );

  const handleDragStart = useCallback(() => {
    dispatch(setDraggedCard(card));
  }, [card, dispatch]);

  const handleDragEnd = useCallback(() => {
    dispatch(setDraggedCard(null));
  }, [dispatch]);

  return (
    <div
      className={classNames("card", {
        clickable,
        selected,
        dragged: isDragged,
        disabled,
      })}
      style={style}
      onClick={handleClick}
      draggable={clickable || draggable}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      {!image && (
        <>
          <div> id: {card.id}</div>
          <div>
            {card.bodypart
              .map((bodypartIndex) => BODYPARTS[bodypartIndex])
              .join(" | ")}
          </div>
          <div>{card.ability !== null ? ABILITIES[card.ability] : "-"} </div>
        </>
      )}
    </div>
  );
};

export function CardEmpty() {
  return <div />;
}

export const CardView: FC<Props & { card: Card | undefined }> = (props) => {
  return props.card ? <CardWithImage {...props} /> : <CardEmpty />;
};

function useCardStatus({
  // card,
  isMyTurn,
  cardOnHand,
  abilityState,
  isMe,
  legionState,
}: {
  card: Card;
  isMyTurn: boolean;
  cardOnHand: boolean;
  abilityState: AbilityState | null;
  isMe: boolean;
  legionState: LegionState | null;
}) {
  // const availableBodyparts = useAppSelector(selectAvailableBodyPartsToInstall);
  const winnerId = useAppSelector((state) => state.app.game?.winnerId);

  const disabled = useMemo(() => {
    // Для карты нет доступного места в любом монстре
    // if (
    //   isMyTurn &&
    //   cardOnHand &&
    //   !hasMatchingPlaceToBeInstalled(card, availableBodyparts)
    // ) {
    //   return true;
    // }

    // Уже был один ход картой определенного легиона - блокируем остальные легионы
    // TODO это условие нужно проверять ровно перед тем как устанавливать карту в монстра
    // if (isMyTurn && lastAction?.match(/PLAY_CARD/)) {
    //   const lastPlayedLegion = lastAction.split(':')[1] as Legion;

    //   return lastPlayedLegion !== card.legion;
    // }
    if (winnerId && cardOnHand) return true;

    return false;
  }, [cardOnHand, winnerId]);

  const clickable = useMemo(() => {
    if (disabled) return false;
    if (abilityState) {
      const smileAbility = abilityState.abilityType === ABILITY_TYPE.SMILE;
      const notMyHand = !cardOnHand;
      const isInMyMonster = isMe;
      const dropAbility = abilityState.abilityType === ABILITY_TYPE.DROP;
      const axeAbility = abilityState.abilityType === ABILITY_TYPE.AXE;
      const teethAbility = abilityState.abilityType === ABILITY_TYPE.TEETH;
      const bonesAbility = abilityState.abilityType === ABILITY_TYPE.BONES;
      const wolfAbility = abilityState.abilityType === ABILITY_TYPE.WOLF;

      if (dropAbility || teethAbility || bonesAbility) return false;

      if (smileAbility && notMyHand && isInMyMonster) return false;
      if (axeAbility && (isInMyMonster || cardOnHand)) return false;
      if (wolfAbility && (isInMyMonster || cardOnHand)) return false;
    }

    // Выбор карты, когда кто-то другой собрал одноцветного монстра
    if (legionState && !cardOnHand && !isMyTurn) return false;

    if (cardOnHand) return true;
    if (!abilityState && isMyTurn && !cardOnHand) return false;
    if (!abilityState && !isMyTurn) return false;

    return true;
  }, [disabled, abilityState, legionState, cardOnHand, isMyTurn, isMe]);

  const draggable = useMemo(() => {
    return clickable;
  }, [clickable]);

  return { disabled, clickable, draggable };
}
