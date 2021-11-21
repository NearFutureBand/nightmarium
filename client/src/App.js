import { useEffect, useState } from 'react';

import { Card, Monster } from './components';
import { ABILITIES, ABILITIES_DESCRIPTION } from './constants';

let socket;

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [game, setGame] = useState({});
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState(null);
  const [awaitingAbility, setAwaitingAbility] = useState({});

  const me = (game?.players || []).find(p => p.id === playerId);
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
    if (!selectedCardId || selectedMonsterId === null) {
      return;
    }
    socket.send(JSON.stringify({ type: "PLAY_CARD", cardId: selectedCardId, monsterId: selectedMonsterId }));
    setSelectedCardId(null);
    setSelectedMonsterId(null);
  }

  const onStartGame = () => {
    socket.send(JSON.stringify({ type: "START" }));
  }

  const onMonsterClick = (monsterId) => {
    if (selectedMonsterId === monsterId) {
      setSelectedMonsterId(null);
    } else {
      setSelectedMonsterId(monsterId);
    }
  }

  const onSelectCardOnHand = (card) => {
    if (card.id === selectedCardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.id);
    }
  }

  const onSpecialCardClick = (card) => {
    if (awaitingAbility.abilityType === 0) {
      setSelectedCardId(selectedCardId === card.id ? null : card.id);
    }
  }

  const onSubmitAbility = () => {
    const payload = {
      abilityType: awaitingAbility.type,
      abilityNumber: awaitingAbility.number,
    }
    
    if (awaitingAbility.abilityType === 1) {
      payload.cards = awaitingAbility.cards;
    }
    
    socket.send(JSON.stringify({
      type: "SUBMIT_ABILITY",
      ...payload
    }));
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

      {typeof awaitingAbility.abilityType === "number" && (
        <div>
          <div>Способность номер {awaitingAbility.abilityNumber + 1} - {ABILITIES[awaitingAbility.abilityType]}</div>
          <div style={{ display: "flex" }}>
            {awaitingAbility.cards && awaitingAbility.cards.map((card) => (
              <Card
                card={card}
                key={card.id}
                onClick={onSpecialCardClick}
                isSelected={selectedCardId === card.id}
              />)
            )}
          </div>
          <div>{ABILITIES_DESCRIPTION[awaitingAbility.abilityType]}</div>
          <button onClick={onSubmitAbility}>{awaitingAbility.submitText}</button>
        </div>
      )}
      
      <div className="player">
        {[0, 1, 2, 3, 4].map((monsterIndex) => {
          const monster = me?.monsters[monsterIndex];
          return (
            <Monster
              monster={monster}
              isSelected={selectedMonsterId === monsterIndex}
              key={monsterIndex}
              onClick={() => onMonsterClick(monsterIndex)}
            >
              {[0, 1, 2].map((bodypartIndex) => {
                const card = monster?.body[bodypartIndex];
                if (card) {
                  return (
                    <Card
                      key={bodypartIndex}
                      card={card}
                      isEmpty={!card}
                      groupId={monsterIndex}
                      placeId={bodypartIndex}
                      //onClick={onMonsterCardClick}
                      //isSelected={placeSelectedOnMonster.groupId === monsterIndex && placeSelectedOnMonster.placeId === bodypartIndex}
                      isMonsterpart
                    />
                  )
                }
                return null;
              })}
            </Monster>
          )
        })}
      </div>
      <div className="my-cards">
        {(me?.cards || []).map((card, index) => (
          <Card
            key={card.id}
            card={card}
            groupId={-1}
            placeId={index}
            onClick={onSelectCardOnHand}
            isSelected={selectedCardId === card.id}
          />
        ))}
      </div>
     
    </div>
  );
}

export default App;
