import { useEffect, useState } from 'react';

import { Card } from './components';

let socket;

const App = () => {

  const [game, setGame] = useState({});
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState(null);

  const me = (game?.players || []).find(p => p.name === "Roman");

  useEffect(() => {
    socket = new WebSocket("ws://localhost:9000");

    socket.onopen = () => {
      console.log("CLIENT: connected");
    }

    socket.onmessage = (event) => {
      const m = JSON.parse(event.data);
      console.log("CLIENT: message", m);
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
    socket.send(JSON.stringify({ type: "PLAY_CARD", cardId: selectedCardId, monsterId: selectedMonsterId }));
    setSelectedCardId(null);
    setSelectedMonsterId(null);
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

  return (
    <div className="App">
      <div className="controls">
        <button onClick={onTakeCard}>Взять карту</button>
        <button onClick={onPlaceCard}>Выложить карту</button>
        <button>Обменять (лучше не надо)</button>
      </div>
      <div className="player">
        {[0, 1, 2, 3, 4].map((monsterIndex) => {
          const monster = me?.monsters[monsterIndex];
          return (
            <div
              className={`monster ${selectedMonsterId === monsterIndex ? 'selected' : ''}`}
              onClick={() => onMonsterClick(monsterIndex)}
              key={monsterIndex}
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
            </div>
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
