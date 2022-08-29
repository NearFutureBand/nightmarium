import { FC, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Card, Monster, Player } from '../types';
import { MONSTER_PART } from '../img';
import { ABILITIES, ABILITY_TYPE, BODYPARTS, COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectIsActive, setDraggedCard, setSelectedCard } from '../slices/App';

type Props = {
  card: Card;
  monster?: Monster;
  player?: Player;
  isMe?: boolean;
  cardOnHand?: boolean;
  cardInControls?: boolean;
};

export const CardWithImage: FC<Props> = ({
  card,
  monster,
  player,
  isMe,
  cardOnHand = false,
  cardInControls = false, // TODO apply this prop
}) => {
  const dispatch = useAppDispatch();
  const selectedCard = useAppSelector((state) => state.app.selectedCard);
  const draggedCard = useAppSelector((state) => state.app.draggedCard);
  const abilityState = useAppSelector((state) => state.app.abilityState);

  const isMyTurn = useAppSelector(selectIsActive(player?.id));

  const isDragged = useMemo(() => {
    return draggedCard?.id === card.id;
  }, [card.id, draggedCard?.id]);

  const clickable = useMemo(() => {
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

    if (cardOnHand) return true;
    if (!abilityState && isMyTurn && !cardOnHand) return false;
    if (!abilityState && !isMyTurn) return false;

    return true;
  }, [abilityState, cardOnHand, isMyTurn, isMe]);

  const draggable = useMemo(() => {
    return clickable;
  }, [clickable]);

  const selected = useMemo(() => {
    const isCardOnHand = player === undefined && monster === undefined;

    if (isCardOnHand && selectedCard?.cardId === card.id) {
      return true;
    }

    return (
      selectedCard?.cardId === card.id &&
      selectedCard.monsterId === monster?.id &&
      selectedCard.playerId === player?.id
    );
  }, [
    card.id,
    monster,
    player,
    selectedCard?.cardId,
    selectedCard?.monsterId,
    selectedCard?.playerId,
  ]);

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

  const handleClick = useCallback(() => {
    if (!clickable) return;
    dispatch(
      setSelectedCard({
        cardId: card.id,
        monsterId: monster?.id,
        playerId: player?.id,
      })
    );
  }, [card.id, clickable, dispatch, monster?.id, player?.id]);

  const handleDragStart = useCallback(() => {
    dispatch(setDraggedCard(card));
  }, [card, dispatch]);

  const handleDragEnd = useCallback(() => {
    dispatch(setDraggedCard(null));
  }, [dispatch]);

  return (
    <div
      className={classNames('card', {
        clickable,
        selected,
        dragged: isDragged,
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
              .join(' | ')}
          </div>
          <div>{card.ability ? ABILITIES[card.ability] : '-'} </div>
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
