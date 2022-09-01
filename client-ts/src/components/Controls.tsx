import { FC, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ABILITIES, ABILITIES_DESCRIPTION, MESSAGE_TYPE } from '../constants';
import { useSendMessage } from '../hooks';
import { deSelectCard, deSelectMonster } from '../slices/App';
import { AbilityState } from '../types';
import { CardView } from './CardView';

// TODO ну тут надо как-то экономить, ибо панели управления слишком схожи между собой

const AbilitiesInterfaceMap = {
  0: null,
  1: ControlsDrop,
  2: null,
  3: null,
  4: null,
  5: null,
};

type Props = {};

export const Controls: FC<Props> = () => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.app.game)!;
  const playerId = useAppSelector((state) => state.app.playerId);
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCard = useAppSelector((state) => state.app.selectedCard);
  const abilityState = useAppSelector((state) => state.app.abilityState);

  const sendMessage = useSendMessage();

  const handlePlaceCard = useCallback(() => {
    if (selectedCard?.cardId && selectedMonster?.monsterId) {
      sendMessage<{ cardId: number; monsterId: number }>({
        type: MESSAGE_TYPE.PLAY_CARD,
        cardId: selectedCard.cardId,
        monsterId: selectedMonster.monsterId,
      });
      dispatch(deSelectMonster());
      dispatch(deSelectCard());
    }
  }, [dispatch, selectedCard?.cardId, selectedMonster?.monsterId, sendMessage]);

  const handleTakeCard = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.TAKE_CARD,
    });
  }, [sendMessage]);

  const isMyTurn = useMemo(() => {
    return playerId === game.activePlayer?.id;
  }, [game.activePlayer?.id, playerId]);

  if (!isMyTurn) return null;

  return (
    <div className="controls">
      {!abilityState ? (
        <main>
          <span>Действий осталось: {game.actions}</span>
          <div>
            <button onClick={handleTakeCard}>Взять карту</button>
            <button onClick={handlePlaceCard}>Выложить карту</button>
            <button onClick={() => {}}>Обменять карты</button>
          </div>
        </main>
      ) : (
        <footer className="ability">
          <div>cпособность: {ABILITIES[abilityState.abilityType]}</div>
          <small>{ABILITIES_DESCRIPTION[abilityState.abilityType]}</small>
          {abilityState.abilityType === 0 && <ControlsWolf />}
          {abilityState.abilityType === 1 && <ControlsDrop />}
          {abilityState.abilityType === 2 && <ControlsSmile />}
          {abilityState.abilityType === 3 && <ControlsAxe />}
          {abilityState.abilityType === 4 && <ControlsBones />}
          {abilityState.abilityType === 5 && <ControlsTeeth />}
        </footer>
      )}
    </div>
  );
};

function ControlsDrop() {
  const abilityState = useAppSelector((state) => state.app.abilityState)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    sendMessage<{ abilityType: number }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
    });
  }, [abilityState, sendMessage]);

  return (
    <div className="controlsDrop">
      {abilityState.cards!.map((card) => (
        <CardView card={card} key={card.id} />
      ))}
      <button onClick={handleSubmit}>Забрать</button>
    </div>
  );
}

function ControlsBones() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (!selectedMonster?.monsterId || !selectedMonster.playerId) return;
    sendMessage<AbilityState>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      ...abilityState,
      ...selectedMonster,
    });
    dispatch(deSelectMonster());
  }, [abilityState, dispatch, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
    });
  }, [sendMessage]);

  return (
    <div className="controlsDrop">
      {selectedMonster && (
        <span>
          {selectedMonster.playerId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button onClick={handleSubmit}>Убить</button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsAxe() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (!selectedMonster?.monsterId || !selectedMonster.playerId) return;
    sendMessage<AbilityState>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      ...abilityState,
      ...selectedMonster,
    });
    dispatch(deSelectMonster());
  }, [abilityState, dispatch, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
    });
  }, [sendMessage]);

  return (
    <div className="controlsDrop">
      {selectedMonster && (
        <span>
          {selectedMonster.playerId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button onClick={handleSubmit}>Забрать</button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsTeeth() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (!selectedMonster?.monsterId || !selectedMonster.playerId) return;
    sendMessage<AbilityState>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      ...abilityState,
      monsterId: selectedMonster.monsterId,
    });
    dispatch(deSelectMonster());
  }, [abilityState, dispatch, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
    });
  }, [sendMessage]);

  return (
    <div className="controlsDrop">
      {selectedMonster && (
        <span>Верхняя карта монстра {selectedMonster.monsterId + 1}</span>
      )}
      <button onClick={handleSubmit}>Убрать</button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsSmile() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCard = useAppSelector((state) => state.app.selectedCard);

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (!selectedMonster?.monsterId || !selectedCard?.cardId) return;

    sendMessage<{ cardId: number; monsterId: number; abilityType: number }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      cardId: selectedCard.cardId,
      monsterId: selectedMonster.monsterId,
      abilityType: abilityState.abilityType,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    abilityState.abilityType,
    dispatch,
    selectedCard?.cardId,
    selectedMonster?.monsterId,
    sendMessage,
  ]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
    });
  }, [sendMessage]);

  return (
    <div className="controlsDrop">
      {
        <span>
          Карта {selectedCard?.cardId || '-'} в монстра{' '}
          {selectedMonster ? selectedMonster?.monsterId + 1 : '-'}
        </span>
      }
      <button onClick={handleSubmit}>Выложить</button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsWolf() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCard = useAppSelector((state) => state.app.selectedCard);

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (!selectedMonster?.monsterId || !selectedCard?.cardId) return;

    sendMessage<{ cardId: number; monsterId: number; abilityType: number }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      cardId: selectedCard.cardId,
      monsterId: selectedMonster.monsterId,
      abilityType: abilityState.abilityType,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    abilityState.abilityType,
    dispatch,
    selectedCard?.cardId,
    selectedMonster?.monsterId,
    sendMessage,
  ]);

  const handleThrowOff = useCallback(() => {
    if (!selectedCard?.cardId) return;
    sendMessage({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      action_experimental: 'THROW OFF',
      cardId: selectedCard.cardId,
      abilityType: abilityState.abilityType,
    });
  }, [abilityState.abilityType, selectedCard?.cardId, sendMessage]);

  return (
    <div className="controlsDrop">
      {abilityState.cards!.map((card) => (
        <CardView card={card} key={card.id} cardInControls />
      ))}
      <div>
        {
          <span>
            Карта {selectedCard?.cardId || '-'} в монстра{' '}
            {selectedMonster ? selectedMonster?.monsterId + 1 : '-'}
          </span>
        }
        <button onClick={handleSubmit}>Выложить</button>
        <button onClick={handleThrowOff}>Сбросить картy</button>
      </div>
    </div>
  );
}
