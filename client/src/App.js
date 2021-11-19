import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { Card } from './components';

let socket;

const App = () => {

  const [game, setGame] = useState({});
  const [cardSelectedOnHand, setCardSelecredOnHand] = useState(null);
  const [placeSelectedOnMonster, setPlaceSelectedOnMonster] = useState({});

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
    socket.send(JSON.stringify({ type: "PLAY_CARD", source: cardSelectedOnHand, destination: placeSelectedOnMonster }));
    setCardSelecredOnHand(null);
    setPlaceSelectedOnMonster({});
  }

  const onMonsterCardClick = (card, groupId, placeId) => {
    if (placeSelectedOnMonster.groupId === groupId && placeSelectedOnMonster.placeId === placeId) {
      setPlaceSelectedOnMonster({});
    } else {
      setPlaceSelectedOnMonster({ groupId, placeId });
    }
  }

  const onSelectCardOnHand = (card) => {
    if (card.id === cardSelectedOnHand?.id) {
      setCardSelecredOnHand(null);
    } else {
      setCardSelecredOnHand(card);
    }
  }

  const onDragEnd = ({ source, destination }) => {
    console.log(source, destination);
    // TODO переписать здесь код, т.к. индексы изменились
    // socket.send(JSON.stringify({
    //   type: "PLAY_CARD",
    //   source: me.cards[source.index],
    //   destination: { groupId: Number(destination.droppableId), placeId: destination.index }
    // }));
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
              <Droppable droppableId={`${monsterIndex}`} key={monsterIndex}>
                {(provided, snapshot) => (
                  <div className="monster" ref={provided.innerRef}>
                    {[0, 1, 2].map((bodypartIndex) => {
                      const card = monster?.body?.[bodypartIndex];
                      if (!card) {
                        return <Card isEmpty />;
                      }
                      return (
                        <Draggable draggableId={`${card.id}`} index={bodypartIndex} key={bodypartIndex}>
                          {(provided, snapshot) => {
                           
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ transform: undefined }}
                              >
                                <Card
                                  card={card}
                                  isEmpty={!card}
                                  groupId={monsterIndex}
                                  placeId={bodypartIndex}
                                  //onClick={onMonsterCardClick}
                                  //isSelected={placeSelectedOnMonster.groupId === monsterIndex && placeSelectedOnMonster.placeId === bodypartIndex}
                                  //disabled={Boolean(cardSelectedOnHand && !cardSelectedOnHand?.bodypart.some(index => index === bodypartIndex) && !card)}
                                  isMonsterpart
                                />
                              </div>
                            )
                          }}
                        </Draggable>
                      )
                    })}
                    
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
        <Droppable droppableId="hand">
          {(provided, snapshot) => (
            <div className="my-cards" ref={provided.innerRef}>
              {(me?.cards || []).map((card, index) => (
                <Draggable draggableId={`${card.id}`} index={index} key={card.id}>
                  {(provided, snapshot) => {
                    if (card.id === 8) {
                      console.log(provided);
                    }
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onTransitionEnd={(event) => { console.log(event); provided.draggableProps.onTransitionEnd(event) }}
                        
                      >
                        <Card
                          key={card.id}
                          card={card}
                          groupId={-1}
                          placeId={index}
                        // onClick={onSelectCardOnHand}
                        // isSelected={cardSelectedOnHand?.id === card.id}
                        // disabled={
                        //   placeSelectedOnMonster.groupId && !card.bodypart.some(bodypartIndex => bodypartIndex === placeSelectedOnMonster.placeId)
                        // }
                        />
                      </div>
                    )
                  }}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

export default App;
