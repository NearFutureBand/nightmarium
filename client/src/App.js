import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Card, Monster, PlayerBoard, MyCards} from './components';
import { ABILITIES, ABILITIES_DESCRIPTION } from './constants';
import { getSelectedMonsterId, getSelectedCardId, selectMonster, selectCard } from './slices';

let socket;

const App = () => {
  const dispatch = useDispatch();

  const selectedMonsterId = useSelector(getSelectedMonsterId);
  const selectedCardId = useSelector(getSelectedCardId);

  const [playerId, setPlayerId] = useState(null);
  const [game, setGame] = useState({});
  const [awaitingAbility, setAwaitingAbility] = useState({});

  const me = (game?.players || []).find(p => p.id === playerId) || {};
  const isMyTurn = game?.activePlayer?.id === playerId;

  useEffect(() => {
    socket = new WebSocket("ws://localhost:9000");

    socket.onopen = () => {
      console.log("CLIENT: connected");
      // if (!playerId) {
      //   const playerId = localStorage.getItem("playerId");
        
      // }
    }

    socket.onmessage = (event) => {
      const m = JSON.parse(event.data);
      console.log("CLIENT: message", m);

      if (m.type === "CONNECTION") {
        localStorage.setItem("playerId", m.playerId);
        setPlayerId(m.playerId);
      }

      if (m.type === "AWAIT_ABILITY") {
        let submitText = "Подтвердить";
        switch (m.abilityType) {
          case 0: {
            submitText = "Расстановка завершена"
            break;
          }
          case 1: {
            submitText = "Забрать";
            break;
          }
          default: { }
        }
        setAwaitingAbility({ ...m, submitText });
      }

      if (m.type === "MONSTER_COMPLETED") {
        setAwaitingAbility({});
      }

      setGame(m.game);
    }

    return () => {
      socket = undefined;
    }
  }, []);

  const onTakeCard = () => {
    socket.send(JSON.stringify({ type: "TAKE_CARD" }));
  }

  const onPlaceCard = () => {
    if (!selectedCardId[0] || selectedMonsterId[0] === null) {
      return;
    }
    socket.send(JSON.stringify({ type: "PLAY_CARD", cardId: selectedCardId[0], monsterId: selectedMonsterId[0] }));
    dispatch(selectCard({ cardId: null }));
    dispatch(selectMonster({ monsterId: null }));
  }

  const onStartGame = () => {
    socket.send(JSON.stringify({ type: "START" }));
  }

  const onSpecialCardClick = (event, card) => {
    if (awaitingAbility.abilityType === 0) {
      //setSelectedCardId(selectedCardId === card.id ? null : card.id);
    }
  }

  const onSubmitAbility = () => {
    const payload = {
      abilityType: awaitingAbility.abilityType,
      abilityNumber: awaitingAbility.abilityNumber,
    }

    // 0 ????
    
    if (awaitingAbility.abilityType === 1) {
      payload.cards = awaitingAbility.cards;
    }

    if (awaitingAbility.abilityType === 2) {
      payload.cardId = selectedCardId[0];
      payload.monsterId = selectedMonsterId[0];
    }

    if (awaitingAbility.abilityType === 3) {
      payload.cardId = selectedCardId[0];
      payload.targetMonsterId = selectedCardId[1];
      payload.targetPlayerId = selectedCardId[2]; 
    }

    if (awaitingAbility.abilityType === 4) {
      payload.targetMonsterId = selectedMonsterId[0];
      payload.targetPlayerId = selectedMonsterId[1];
    }

    if (awaitingAbility.abilityType === 5) {
      payload.cardId = selectedCardId[0];
      payload.targetMonsterId = selectedCardId[2];
    }

    
    socket.send(JSON.stringify({
      type: "SUBMIT_ABILITY",
      ...payload
    }));

    if (awaitingAbility.abilityType === 2) {
      dispatch(selectCard({ cardId: null }));
      dispatch(selectMonster({ monsterId: null }));
    }
  }

  if (!game?.activePlayer) {
    return (
      <div className="App">
        Привет, {playerId}. <button onClick={onStartGame}>Начать игру</button>
      </div>
    )
  }

  return (
    <div className="App">
      <div>Я  - {playerId}. Ходит {game?.activePlayer?.id}</div>
      {(isMyTurn && typeof awaitingAbility.abilityType !== "number") && (
        <div className="controls">
          <div>Действий осталось: {game.actions}</div>
          <button onClick={onTakeCard}>Взять карту</button>
          <button onClick={onPlaceCard}>Выложить карту</button>
          {/* <button>Обменять (лучше не надо)</button> */}
        </div>
      )}

      {(isMyTurn && typeof awaitingAbility.abilityType === "number") && (
        <div>
          <div>Способность номер {awaitingAbility.abilityNumber + 1} - {ABILITIES[awaitingAbility.abilityType]}</div>
          <div style={{ display: "flex" }}>
            {awaitingAbility.cards && awaitingAbility.cards.map((card) => (
              <Card
                card={card}
                key={card.id}
                onClick={onSpecialCardClick}
                //isSelected={selectedCardId === card.id}
              />)
            )}
          </div>
          <div>{ABILITIES_DESCRIPTION[awaitingAbility.abilityType]}</div>
          <button onClick={onSubmitAbility}>{awaitingAbility.submitText}</button>
        </div>
      )}

      <div>Мои монстры</div>
      <PlayerBoard player={me} isMyTurn={isMyTurn} awaitingAbility={awaitingAbility} itsMe />
      
      <div className="players">
        {(game.players || []).map((player) => {
          if (player.id === me.id) {
            return null;
          }
          return <PlayerBoard player={player} key={player.id} awaitingAbility={awaitingAbility} isMyTurn={isMyTurn} />
        })}
      </div>
      
      <MyCards cards={me.cards || []} />

      <div className="placeholder"/>
     
    </div>
  );
}

export default App;
