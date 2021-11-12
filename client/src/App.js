import { useEffect, useState } from 'react';

const BODYPARTS = {
  0: "Ноги",
  1: "Туловище",
  2: "Голова"
}

const ABILITIES = {
  0: "Волк",
  1: "Капля",
  2: "Улыбка",
  3: "Топор",
  4: "Кости",
  5: "Зубы"
}

let socket;

const App = () => {

  const [game, setGame] = useState({});

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

  return (
    <div className="App">
      <div className="controls">
        <button>Взять карту</button>
        <button>Выложить карту</button>
        <button>Обменять (лучше не надо)</button>
      </div>
      <div className="player">
        {[0, 1, 2, 3, 4].map((monsterIndex) => {
          const monster = me?.monsters[monsterIndex];
          return (
            <div className="monster">
              {[0, 1, 2].map((bodypartIndex) => {
                const card = monster?.body[bodypartIndex];
                if (!card) {
                  return <div className="card empty" />
                }
                return (
                  <div className="card">
                    <div> id: {card.id}</div>
                    <div> часть тела: {BODYPARTS[card.bodypart]} </div>
                    <div> способность: {ABILITIES[card.ability] || '-'} </div>
                    <div> легион: {card.legion}</div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="my-cards">
        {(me?.cards || []).map(card => (
          <div className="card">
            <div> id: {card.id}</div>
            <div> часть тела: {BODYPARTS[card.bodypart]} </div>
            <div> способность: {ABILITIES[card.ability] || '-'} </div>
            <div> легион: {card.legion}</div>
          </div>
        ))}
      </div>
     
    </div>
  );
}

export default App;
