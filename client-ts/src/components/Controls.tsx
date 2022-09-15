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
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const abilityState = useAppSelector((state) => state.app.abilityState);
  const legionState = useAppSelector((state) => state.app.awaitingLegion);

  const isCardSelected = useMemo(
    () => selectedCards.length === 0,
    [selectedCards.length]
  );

  const sendMessage = useSendMessage();

  const handlePlaceCard = useCallback(() => {
    if (isCardSelected && selectedMonster?.monsterId !== undefined) {
      sendMessage<{ cardId: number; monsterId: number }>({
        type: MESSAGE_TYPE.PLAY_CARD,
        cardId: selectedCards[0].cardId,
        monsterId: selectedMonster.monsterId,
      });
      dispatch(deSelectMonster());
      dispatch(deSelectCard());
    }
  }, [
    dispatch,
    isCardSelected,
    selectedCards,
    selectedMonster?.monsterId,
    sendMessage,
  ]);

  const handleTakeCard = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.TAKE_CARD,
    });
  }, [sendMessage]);

  const isMyTurn = useMemo(() => {
    return playerId === game.activePlayer?.id;
  }, [game.activePlayer?.id, playerId]);

  if (legionState) {
    return <ControlsLegionMode isMyTurn={isMyTurn} />;
  }
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
    if (selectedMonster?.monsterId === undefined || !selectedMonster.playerId)
      return;
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
    if (selectedMonster?.monsterId === undefined || !selectedMonster.playerId)
      return;
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
    if (selectedMonster?.monsterId === undefined || !selectedMonster?.playerId)
      return;
    sendMessage({
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
  const selectedCards = useAppSelector((state) => state.app.selectedCards);

  const isCardSelected = useMemo(
    () => selectedCards.length === 0,
    [selectedCards.length]
  );

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (selectedMonster?.monsterId === undefined || !isCardSelected) return;

    sendMessage<{ cardId: number; monsterId: number; abilityType: number }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      cardId: selectedCards[0].cardId, // TODO
      monsterId: selectedMonster!.monsterId,
      abilityType: abilityState.abilityType,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    abilityState.abilityType,
    dispatch,
    isCardSelected,
    selectedCards,
    selectedMonster,
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
          Карта {selectedCards[0].cardId || '-'} в монстра{' '}
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
  const selectedCards = useAppSelector((state) => state.app.selectedCards);

  const isCardSelected = useMemo(
    () => selectedCards.length === 0,
    [selectedCards.length]
  );

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    if (selectedMonster?.monsterId === undefined || !isCardSelected) return;

    sendMessage<{ cardId: number; monsterId: number; abilityType: number }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      cardId: selectedCards[0].cardId, // TODO
      monsterId: selectedMonster.monsterId,
      abilityType: abilityState.abilityType,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    abilityState.abilityType,
    dispatch,
    isCardSelected,
    selectedCards,
    selectedMonster?.monsterId,
    sendMessage,
  ]);

  const handleThrowOff = useCallback(() => {
    if (!isCardSelected) return;
    sendMessage({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      action_experimental: 'THROW OFF',
      cardId: selectedCards[0].cardId, // TODO
      abilityType: abilityState.abilityType,
    });
  }, [abilityState.abilityType, isCardSelected, selectedCards, sendMessage]);

  return (
    <div className="controlsDrop">
      {abilityState.cards!.map((card) => (
        <CardView card={card} key={card.id} cardInControls />
      ))}
      <div>
        {
          <span>
            Карта {selectedCards[0].cardId || '-'} в монстра{' '}
            {selectedMonster ? selectedMonster?.monsterId + 1 : '-'}
          </span>
        }
        <button onClick={handleSubmit}>Выложить</button>
        <button onClick={handleThrowOff}>Сбросить картy</button>
      </div>
    </div>
  );
}

function ControlsLegionMode({ isMyTurn }: { isMyTurn: boolean }) {
  const dispatch = useAppDispatch();
  const legionState = useAppSelector((state) => state.app.awaitingLegion);
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const playerId = useAppSelector((state) => state.app.playerId)!;

  const isCardSelected = useMemo(
    () => selectedCards.length === 0,
    [selectedCards.length]
  );

  const sendMessage = useSendMessage();

  const handleThrow = useCallback(() => {
    if (!isCardSelected) return;

    sendMessage<{ cardId: number; playerId: string }>({
      type: MESSAGE_TYPE.THROW_LEGION_CARD,
      cardId: selectedCards[0].cardId, // TODO
      playerId: playerId!,
    });
    dispatch(deSelectCard());
  }, [dispatch, isCardSelected, playerId, selectedCards, sendMessage]);

  return (
    <div className="controls">
      {isMyTurn ||
      legionState!.players[playerId].respondedCorrectly === true ? (
        'Ожидается сброс карт от других игроков'
      ) : (
        <>
          Сбросьте карту легиона {legionState?.legion} или две другие.
          {isCardSelected && <span> Выбрано: {selectedCards[0].cardId}</span>}
          <button disabled={!Boolean(isCardSelected)} onClick={handleThrow}>
            Сбросить
          </button>
        </>
      )}
    </div>
  );
}
