import { FC, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ABILITIES, ABILITIES_DESCRIPTION, ABILITY_TYPE, MESSAGE_TYPE } from '../constants';
import { validateCardToMonster } from '../helpers';
import { useSendMessage } from '../hooks';
import { deSelectCard, deSelectMonster, selectGameId, selectLastAction } from '../slices/App';
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
// TODO тут все пересмотреть на основе новых данных
export const Controls: FC<Props> = () => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.app.game)!;
  const playerId = useAppSelector((state) => state.app.me?.id);
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const abilityState = useAppSelector((state) => state.app.abilityState);
  const legionState = useAppSelector((state) => state.app.awaitingLegion);
  const lastAction = useAppSelector(selectLastAction);
  const winnerId = useAppSelector((state) => state.app.game?.winnerId);

  const sendMessage = useSendMessage();

  const handlePlaceCard = useCallback(() => {
    if (selectedCards.length !== 1) return;
    if (!selectedMonster?.monsterId) return;

    const validationError = validateCardToMonster({
      selectedCard: selectedCards[0],
      selectedMonster,
      lastAction,
      abilityState,
    });
    if (validationError) {
      toast(validationError, { type: 'error' });
      dispatch(deSelectMonster());
      dispatch(deSelectCard());
      return;
    }

    sendMessage<{ cardId: number; monsterId: number; gameId: string }>({
      type: MESSAGE_TYPE.PLAY_CARD,
      cardId: selectedCards[0]?.cardId, // TODO
      monsterId: selectedMonster.monsterId,
      gameId: game.id,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [abilityState, dispatch, game.id, lastAction, selectedCards, selectedMonster, sendMessage]);

  const handleTakeCard = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.TAKE_CARD,
      gameId: game.id,
    });
  }, [game.id, sendMessage]);

  const handleChangeCards = useCallback(() => {
    sendMessage<{ cardIds: number[]; gameId: string }>({
      type: MESSAGE_TYPE.CHANGE_CARDS,
      cardIds: selectedCards.map((card) => card.cardId),
      gameId: game.id,
    });
    dispatch(deSelectCard());
  }, [dispatch, game.id, selectedCards, sendMessage]);

  const handleLeaveGame = useCallback(() => {
    sendMessage<{ playerId: string; gameId: string }>({
      type: MESSAGE_TYPE.LEAVE_GAME,
      playerId: playerId!,
      gameId: game.id,
    });
  }, [game.id, playerId, sendMessage]);

  const isMyTurn = useMemo(() => {
    return playerId === game.activePlayer?.id;
  }, [game.activePlayer?.id, playerId]);

  if (legionState) {
    return <ControlsLegionMode isMyTurn={isMyTurn} />;
  }

  // TODO отрефакторить
  if (winnerId) {
    // TODO возможно эта кнопка будет появляться спустя 10 секунд
    return (
      <div className="controls">
        <button onClick={handleLeaveGame}>Выйти из игры</button>
      </div>
    );
  }

  if (!isMyTurn) return null;

  return (
    <div className="controls">
      {!abilityState ? (
        <main>
          <span>Действий осталось: {game.actions}</span>
          {lastAction && <span> {lastAction}</span>}
          <div>
            <button onClick={handleTakeCard}>Взять карту</button>
            <button onClick={handlePlaceCard}>Выложить карту</button>
            <button disabled={selectedCards.length < 2} onClick={handleChangeCards}>
              Обменять карты
            </button>
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

function ControlsWolf() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const gameId = useAppSelector(selectGameId)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    // Функция не вызовется, если selectedMonster не существует, поэтому можно восклицательный. Также selectedCards
    // гарантированно будет иметь только один элемент. Все эти условия находятся в disabled проперти кнопки
    sendMessage<{ cardIds: number[]; monsterId: number; abilityType: number; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      cardIds: [selectedCards[0].cardId],
      monsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [abilityState.abilityType, dispatch, gameId, selectedCards, selectedMonster, sendMessage]);

  const handleThrowOff = useCallback(() => {
    sendMessage<{ abilityType: ABILITY_TYPE; action_experimental?: string; cardIds: number[]; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      action_experimental: 'THROW OFF',
      cardIds: selectedCards.map((c) => c.cardId),
      gameId,
    });
  }, [abilityState.abilityType, gameId, selectedCards, sendMessage]);

  const isSubmitBlocked = useMemo(() => {
    return selectedMonster?.monsterId === undefined || selectedCards.length !== 1;
  }, [selectedCards.length, selectedMonster?.monsterId]);

  return (
    <div className="controlsDrop">
      {abilityState.cards!.map((card) => (
        <CardView card={card} key={card.id} cardInControls />
      ))}
      <div>
        <span>
          Карта {selectedCards[0]?.cardId || '-'} в монстра {selectedMonster ? selectedMonster?.monsterId + 1 : '-'}
        </span>
        <button onClick={handleSubmit} disabled={isSubmitBlocked}>
          Выложить
        </button>
        <button onClick={handleThrowOff} disabled={selectedCards.length === 0}>
          Сбросить карт{selectedCards.length === 1 ? 'у' : 'ы'}
        </button>
      </div>
    </div>
  );
}

function ControlsDrop() {
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const gameId = useAppSelector(selectGameId)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    sendMessage<{ abilityType: number; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      gameId,
    });
  }, [abilityState.abilityType, gameId, sendMessage]);

  return (
    <div className="controlsDrop">
      <div className="cards">
        {abilityState.cards!.map((card) => (
          <CardView card={card} key={card.id} />
        ))}
      </div>
      <button onClick={handleSubmit}>Забрать</button>
    </div>
  );
}

function ControlsSmile() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const gameId = useAppSelector(selectGameId)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    sendMessage<{ cardId: number; monsterId: number; abilityType: number; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      cardId: selectedCards[0].cardId,
      monsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [abilityState.abilityType, dispatch, gameId, selectedCards, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className="controlsDrop">
      {(selectedCards.length > 1 || selectedMonster) && (
        <span>
          Карта {selectedCards[0]?.cardId || '-'} в монстра {selectedMonster ? selectedMonster?.monsterId + 1 : '-'}
        </span>
      )}
      <button onClick={handleSubmit} disabled={selectedMonster?.monsterId === undefined || selectedCards.length !== 1}>
        Выложить
      </button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsAxe() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const gameId = useAppSelector(selectGameId)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    // пре-условие стоит в кнопке
    sendMessage<{ targetPlayerId: string; targetMonsterId: number; abilityType: number; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      targetPlayerId: selectedMonster!.playerId,
      targetMonsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
  }, [abilityState.abilityType, dispatch, gameId, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className="controlsDrop">
      {selectedMonster && (
        <span>
          {selectedMonster.playerId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button onClick={handleSubmit} disabled={selectedMonster?.monsterId === undefined || !selectedMonster.playerId}>
        Забрать
      </button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsBones() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const gameId = useAppSelector(selectGameId)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    // пре-условие стоит в кнопке
    sendMessage<{ targetPlayerId: string; targetMonsterId: number; abilityType: number; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      targetPlayerId: selectedMonster!.playerId,
      targetMonsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
  }, [abilityState.abilityType, dispatch, gameId, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className="controlsDrop">
      {selectedMonster && (
        <span>
          {selectedMonster.playerId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button onClick={handleSubmit} disabled={selectedMonster?.monsterId === undefined || !selectedMonster.playerId}>
        Убить
      </button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsTeeth() {
  const dispatch = useAppDispatch();
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const gameId = useAppSelector(selectGameId)!;

  const sendMessage = useSendMessage();

  const handleSubmit = useCallback(() => {
    // пре-условие стоит в кнопке
    sendMessage<{ targetMonsterId: number; abilityType: number; gameId: string }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      targetMonsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
  }, [abilityState.abilityType, dispatch, gameId, selectedMonster, sendMessage]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className="controlsDrop">
      {selectedMonster && <span>Верхняя карта монстра {selectedMonster.monsterId + 1}</span>}
      <button onClick={handleSubmit} disabled={selectedMonster?.monsterId === undefined || !selectedMonster?.playerId}>
        Убрать
      </button>
      <button onClick={handleNotAble}>Не могу выполнить</button>
    </div>
  );
}

function ControlsLegionMode({ isMyTurn }: { isMyTurn: boolean }) {
  const dispatch = useAppDispatch();
  const legionState = useAppSelector((state) => state.app.awaitingLegion);
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const playerId = useAppSelector((state) => state.app.me?.id)!;
  const gameId = useAppSelector(selectGameId)!;

  const isCardSelected = useMemo(() => selectedCards.length !== 0, [selectedCards.length]);

  const sendMessage = useSendMessage();

  const handleThrow = useCallback(() => {
    if (!isCardSelected) return;

    sendMessage<{ cardIds: number[]; playerId: string; gameId: string }>({
      type: MESSAGE_TYPE.THROW_LEGION_CARD,
      cardIds: selectedCards.map((selectedCards) => selectedCards.cardId),
      playerId: playerId!,
      gameId,
    });
    dispatch(deSelectCard());
  }, [dispatch, gameId, isCardSelected, playerId, selectedCards, sendMessage]);

  return (
    <div className="controls">
      {isMyTurn || legionState!.players[playerId].respondedCorrectly === true ? (
        'Ожидается сброс карт от других игроков'
      ) : (
        <>
          Сбросьте карту легиона {legionState?.legion} или две другие.
          {isCardSelected && <span> Выбрано: {selectedCards.map((selectedCards) => selectedCards.cardId).join(', ')}</span>}
          <button disabled={!Boolean(isCardSelected)} onClick={handleThrow}>
            Сбросить
          </button>
        </>
      )}
    </div>
  );
}
