import { FC, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  ABILITIES,
  ABILITIES_DESCRIPTION,
  ABILITY_TYPE,
  MESSAGE_TYPE,
} from "src/constants";
import { validateCardToMonster } from "../helpers";
import { useSendMessage } from "src/hooks/useWebsocket";
import {
  deSelectCard,
  deSelectMonster,
  selectGameId,
  selectLastAction,
} from "../slices/App";
import { Legion } from "../types";
import { CardView } from "./CardView";
import { useAppSelector } from "src/hooks/useAppSelector";
import { useAppDispatch } from "src/hooks/useAppDispatch";

// TODO ну тут надо как-то экономить, ибо панели управления слишком схожи между собой

const AbilitiesInterfaceMap: { [key: number]: JSX.Element } = {
  0: <ControlsWolf />,
  1: <ControlsDrop />,
  2: <ControlsSmile />,
  3: <ControlsAxe />,
  4: <ControlsBones />,
  5: <ControlsTeeth />,
};

export const Controls: FC = () => {
  const userId = useAppSelector((state) => state.app.me?.id);
  const game = useAppSelector((state) => state.app.game)!;
  const abilityState = useAppSelector((state) => state.app.abilityState);
  const legionState = useAppSelector((state) => state.app.awaitingLegion);
  const winnerId = useAppSelector((state) => state.app.game?.winnerId);

  const isMyTurn = useMemo(() => {
    return userId === game.activePlayer?.id;
  }, [game.activePlayer?.id, userId]);

  if (winnerId) {
    return <ControlsIfGameIsOver />;
  }

  if (legionState) {
    return <ControlsLegionMode isMyTurn={isMyTurn} />;
  }

  if (!isMyTurn) return null;

  return (
    <div className='controls'>
      {!abilityState && <ControlsGameMode />}
      {abilityState && <ControlsForAbility />}
    </div>
  );
};

function ControlsGameMode() {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.app.game)!;
  const selectedMonster = useAppSelector((state) => state.app.selectedMonster);
  const selectedCards = useAppSelector((state) => state.app.selectedCards);
  const lastAction = useAppSelector(selectLastAction);
  const sendMessage = useSendMessage();

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

  const handlePlaceCard = useCallback(() => {
    if (selectedCards.length !== 1) return;
    if (!selectedMonster?.monsterId) return;

    const validationError = validateCardToMonster({
      selectedCard: selectedCards[0],
      selectedMonster,
      lastAction,
      abilityState: null,
    });
    if (validationError) {
      toast(validationError, { type: "error" });
      dispatch(deSelectMonster());
      dispatch(deSelectCard());
      return;
    }

    sendMessage<{ cardId: number; monsterId: number; gameId: string }>({
      type: MESSAGE_TYPE.PLAY_CARD,
      cardId: selectedCards[0].cardId,
      monsterId: selectedMonster.monsterId,
      gameId: game.id,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    dispatch,
    game.id,
    lastAction,
    selectedCards,
    selectedMonster,
    sendMessage,
  ]);

  return (
    <main>
      <div>
        <div>
          Действий осталось: <strong>{game.actions}</strong>
        </div>
        <LastStep />
      </div>

      <div>
        <button onClick={handleTakeCard}>Взять карту</button>
        <button onClick={handlePlaceCard}>Выложить карту</button>
        <button disabled={selectedCards.length < 2} onClick={handleChangeCards}>
          Обменять карты
        </button>
      </div>
    </main>
  );
}

function LastStep() {
  const lastAction = useAppSelector(selectLastAction);

  const parsed = useMemo(() => {
    if (!lastAction) return "";
    if (/CHANGE_CARDS/.test(lastAction)) {
      return "смена карт";
    }
    if (/TAKE_CARD/.test(lastAction)) {
      return "взята карта";
    }
    const [, legion] = lastAction.split(":") as [string, Legion];
    return (
      <>
        сыграна карта легиона <strong>{legion}</strong>
      </>
    );
  }, [lastAction]);

  return lastAction ? <span>Последний ход: {parsed}</span> : null;
}

function ControlsIfGameIsOver() {
  const winnerId = useAppSelector((state) => state.app.game?.winnerId);
  const userId = useAppSelector((state) => state.app.me?.id);
  const game = useAppSelector((state) => state.app.game)!;
  const sendMessage = useSendMessage();
  const handleLeaveGame = useCallback(() => {
    sendMessage<{ userId: string; gameId: string }>({
      type: MESSAGE_TYPE.LEAVE_GAME,
      userId: userId!,
      gameId: game.id,
    });
  }, [game.id, userId, sendMessage]);
  return winnerId ? (
    <button onClick={handleLeaveGame}>Выйти из игры</button>
  ) : null;
}

function ControlsForAbility() {
  const abilityState = useAppSelector((state) => state.app.abilityState)!;
  return (
    <div className='ability'>
      <div>cпособность: {ABILITIES[abilityState.abilityType]}</div>
      <small>{ABILITIES_DESCRIPTION[abilityState.abilityType]}</small>
      {AbilitiesInterfaceMap[abilityState.abilityType]}
    </div>
  );
}

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
    sendMessage<{
      cardIds: number[];
      monsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      cardIds: [selectedCards[0].cardId],
      monsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    abilityState.abilityType,
    dispatch,
    gameId,
    selectedCards,
    selectedMonster,
    sendMessage,
  ]);

  const handleThrowOff = useCallback(() => {
    sendMessage<{
      abilityType: ABILITY_TYPE;
      action_experimental?: string;
      cardIds: number[];
      gameId: string;
    }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      action_experimental: "THROW OFF",
      cardIds: selectedCards.map((c) => c.cardId),
      gameId,
    });
  }, [abilityState.abilityType, gameId, selectedCards, sendMessage]);

  const isSubmitBlocked = useMemo(() => {
    return (
      selectedMonster?.monsterId === undefined || selectedCards.length !== 1
    );
  }, [selectedCards.length, selectedMonster?.monsterId]);

  return (
    <div className='controlsDrop'>
      {abilityState.cards!.map((card) => (
        <CardView card={card} key={card.id} cardInControls />
      ))}
      <div>
        <span>
          Карта {selectedCards[0]?.cardId || "-"} в монстра{" "}
          {selectedMonster ? selectedMonster?.monsterId + 1 : "-"}
        </span>
        <button onClick={handleSubmit} disabled={isSubmitBlocked}>
          Выложить
        </button>
        <button onClick={handleThrowOff} disabled={selectedCards.length === 0}>
          Сбросить карт{selectedCards.length === 1 ? "у" : "ы"}
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
    <div className='controlsDrop'>
      <div className='cards'>
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
    sendMessage<{
      cardId: number;
      monsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      cardId: selectedCards[0].cardId,
      monsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
    dispatch(deSelectCard());
  }, [
    abilityState.abilityType,
    dispatch,
    gameId,
    selectedCards,
    selectedMonster,
    sendMessage,
  ]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className='controlsDrop'>
      {(selectedCards.length > 1 || selectedMonster) && (
        <span>
          Карта {selectedCards[0]?.cardId || "-"} в монстра{" "}
          {selectedMonster ? selectedMonster?.monsterId + 1 : "-"}
        </span>
      )}
      <button
        onClick={handleSubmit}
        disabled={
          selectedMonster?.monsterId === undefined || selectedCards.length !== 1
        }
      >
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
    sendMessage<{
      targetPlayerId: string;
      targetMonsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      targetPlayerId: selectedMonster!.userId,
      targetMonsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
  }, [
    abilityState.abilityType,
    dispatch,
    gameId,
    selectedMonster,
    sendMessage,
  ]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className='controlsDrop'>
      {selectedMonster && (
        <span>
          {selectedMonster.userId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button
        onClick={handleSubmit}
        disabled={
          selectedMonster?.monsterId === undefined || !selectedMonster.userId
        }
      >
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
    sendMessage<{
      targetPlayerId: string;
      targetMonsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      targetPlayerId: selectedMonster!.userId,
      targetMonsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
  }, [
    abilityState.abilityType,
    dispatch,
    gameId,
    selectedMonster,
    sendMessage,
  ]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className='controlsDrop'>
      {selectedMonster && (
        <span>
          {selectedMonster.userId}: {selectedMonster.monsterId + 1}-й монстр
        </span>
      )}
      <button
        onClick={handleSubmit}
        disabled={
          selectedMonster?.monsterId === undefined || !selectedMonster.userId
        }
      >
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
    sendMessage<{
      targetMonsterId: number;
      abilityType: number;
      gameId: string;
    }>({
      type: MESSAGE_TYPE.SUBMIT_ABILITY,
      abilityType: abilityState.abilityType,
      targetMonsterId: selectedMonster!.monsterId,
      gameId,
    });
    dispatch(deSelectMonster());
  }, [
    abilityState.abilityType,
    dispatch,
    gameId,
    selectedMonster,
    sendMessage,
  ]);

  const handleNotAble = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPE.CANCEL_ABILITY,
      gameId,
    });
  }, [gameId, sendMessage]);

  return (
    <div className='controlsDrop'>
      {selectedMonster && (
        <span>Верхняя карта монстра {selectedMonster.monsterId + 1}</span>
      )}
      <button
        onClick={handleSubmit}
        disabled={
          selectedMonster?.monsterId === undefined || !selectedMonster?.userId
        }
      >
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

  const oneOrTwoCardsSelected = useMemo(
    () => selectedCards.length > 0 && selectedCards.length <= 2,
    [selectedCards.length]
  );

  const sendMessage = useSendMessage();

  const handleThrow = useCallback(() => {
    if (!oneOrTwoCardsSelected) return;

    sendMessage<{ cardIds: number[]; playerId: string; gameId: string }>({
      type: MESSAGE_TYPE.THROW_LEGION_CARD,
      cardIds: selectedCards.map((selectedCards) => selectedCards.cardId),
      playerId: playerId!,
      gameId,
    });
    dispatch(deSelectCard());
  }, [
    dispatch,
    gameId,
    oneOrTwoCardsSelected,
    playerId,
    selectedCards,
    sendMessage,
  ]);

  console.log({legionState})

  return (
    <div className='controls'>
      {isMyTurn || legionState!.players[playerId].respondedCorrectly === true ? (
        "Ожидается сброс карт от других игроков"
      ) : (
        <>
          Сбросьте карту легиона {legionState?.legion} или две другие.
          {oneOrTwoCardsSelected && (
            <span>
              {" "}
              Выбрано:{" "}
              {selectedCards
                .map((selectedCards) => selectedCards.cardId)
                .join(", ")}
            </span>
          )}
          <button disabled={!oneOrTwoCardsSelected} onClick={handleThrow}>
            Сбросить
          </button>
        </>
      )}
    </div>
  );
}
