import { useEffect, useState } from 'react';

import { Card, Monster } from './components';

let socket;

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [game, setGame] = useState({});
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState(null);

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
      {isMyTurn && (
        <div className="controls">
          <div>Действий осталось: {game.actions}</div>
          <button onClick={onTakeCard}>Взять карту</button>
          <button onClick={onPlaceCard}>Выложить карту</button>
          {/* <button>Обменять (лучше не надо)</button> */}
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
